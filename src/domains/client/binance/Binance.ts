import axios, { AxiosInstance } from "axios";
import https from "https";
import Binance from "node-binance-api";
import { CandleInterval, Candlestick, Window } from "../../../types/Candle";
import { Pairs } from "../../../types/Pair";
import { Order } from "../../../types/Order";
import { PairInfo } from "../../../types/Pair";
import logger from "../../../utils/logger";
import { PairsResponseDTO } from "../dtos/PairResponseDTO";

import { CandlestickParser } from "./parsers/CandleParser";
import { SymbolParser } from "./parsers/SymbolParser";
import { updateBalanceWsDTO } from "../dtos/BalanceWebSocketDTO";
import { Balance } from "../../services/WalletUserService";
import { BalanceParser } from "./parsers/BalanceParser";
import { OrderParser } from "./parsers/OrderParser";
import { BalanceResponseDTO } from "../dtos/BalanceResponseDTO";
import CandleWsResponseDTO from "../dtos/CandleWebSocketResponseDTO";
import { PairOrderResponseDTO } from "../dtos/PairOrderResponseDTO";

interface historicalParams {
  pair: Pairs;
  interval: CandleInterval;
  window?: Window;
}

class BinanceClient {
  client: Binance;
  private axios: AxiosInstance;

  constructor({
    apiKey,
    apiSecret,
    useServerTime,
    test = false,
  }: {
    apiKey: string;
    apiSecret: string;
    useServerTime: boolean;
    test?: boolean;
  }) {
    const client = new Binance().options({
      APIKEY: apiKey,
      APISECRET: apiSecret,
      recvWindow: 30000,
      useServerTime,
      test,
      family: 4,
    });

    this.axios = axios.create();

    this.client = client;
  }

  async getHistorical({
    pair,
    interval = "5m",
    window = 20,
  }: historicalParams) {
    logger.log({
      from: "BINANCE CLIENT",
      message: `getting historical price of ${pair}`,
    });
    return new Promise<Candlestick[]>((resolve, reject) => {
      this.client.candlesticks(
        pair,
        interval,
        (error: any, ticks: any[], pair: any) => {
          if (error) {
            reject(error);
            return;
          }
          const parsedTicks = CandlestickParser.parseHistorical(
            pair,
            interval,
            ticks
          );
          resolve(parsedTicks);
          return;
        },
        { limit: window * 2 }
      );
    });
  }

  async currentPrice(pair: Pairs): Promise<number> {
    return new Promise((resolve, reject) => {
      logger.log({
        from: "BINANCE CLIENT",
        message: `Getting current value of ${pair}`,
      });
      this.client.prices(
        pair,
        (error: any, ticker: { [key: string]: string }) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(parseFloat(ticker[pair]));
          return;
        }
      );
    });
  }

  async wait(cb: any) {
    await this.client.useServerTime(cb);
  }

  async currentBalance(coins: string[]): Promise<Balance> {
    return new Promise((resolve, reject) => {
      this.client.balance((error, balances: BalanceResponseDTO) => {
        if (error) {
          reject(error);
          return;
        }
        const parsedBalance = BalanceParser.parseCurrentBalance(
          coins,
          balances
        );
        resolve(parsedBalance);
        return;
      });
    });
  }

  async createBuyOrder(
    coin: Pairs,
    quantity: number,
    price: number
  ): Promise<Order> {
    logger.log({ from: "BINANCE CLIENT", message: `Creating a buy order` });

    return new Promise((resolve, reject) => {
      this.client.buy(
        coin,
        quantity,
        price,
        { type: "LIMIT" },
        (error, response: PairOrderResponseDTO) => {
          if (error) {
            reject(error);
            return;
          }
          const parsedOrder = OrderParser.parsePairOrder(response);

          logger.log({ from: "BINANCE CLIENT", message: `Buy order created` });
          logger.log({
            from: "BINANCE CLIENT",
            message: `Buy order: ${parsedOrder.id}`,
          });

          resolve(parsedOrder);
          return;
        }
      );
    });
  }

  async createSellOrder(
    coin: Pairs,
    quantity: number,
    price: number
  ): Promise<Order> {
    logger.log({ from: "BINANCE CLIENT", message: `Creating a sell order` });
    return new Promise((resolve, reject) => {
      this.client.sell(
        coin,
        quantity,
        price,
        { type: "LIMIT" },
        (error, response: PairOrderResponseDTO) => {
          if (error) {
            reject(error);
            return;
          }
          const parsedOrder = OrderParser.parsePairOrder(response);
          logger.log({ from: "BINANCE CLIENT", message: `Sell order created` });
          logger.log({
            from: "BINANCE CLIENT",
            message: `Sell order: ${parsedOrder.id}`,
          });

          resolve(parsedOrder);
          return;
        }
      );
    });
  }

  async orderStatus(order: Order): Promise<Order> {
    logger.log({
      from: "BINANCE CLIENT",
      message: `Checking order status: ${order.id}`,
    });
    return this.client.orderStatus(order.pair, order.id);
  }

  async cancelOrder(order: Order): Promise<void> {
    logger.log({
      from: "BINANCE CLIENT",
      message: `Canceling order ${order.id}`,
    });
    return new Promise((resolve, reject) => {
      this.client.cancel(order.pair, order.id, (error: any, response: any) => {
        if (error) {
          reject(error);
          return;
        }

        logger.log({
          from: "BINANCE CLIENT",
          message: `Order canceled: ${order.id}`,
        });
        resolve(response);
        return;
      });
    });
  }

  async lastOrder(pair: Pairs): Promise<Order | null> {
    return new Promise<Order>((resolve, reject) => {
      this.client.allOrders(
        pair,
        (error, orders: PairOrderResponseDTO[], symbol) => {
          if (error) {
            reject(error);
            return;
          }
          if (orders.length === 0) {
            return null;
          }
          const parsedOrder = OrderParser.parsePairOrder(orders[0]);
          resolve(parsedOrder);
        },
        { limit: 1 }
      );
    });
  }

  async PairInfo(pair: Pairs): Promise<PairInfo> {
    const response = await this.axios.get<PairsResponseDTO>(
      `https://api.binance.com/api/v3/exchangeInfo?symbol=${pair}`
    );
    return SymbolParser.parse(response.data)[0];
  }

  async createWsBalanceAndOrderUpdate({
    balanceCallback,
    orderCallback,
  }: {
    balanceCallback: (balance: Balance) => void;
    orderCallback: (order: Order) => void;
  }) {
    logger.log({
      from: "BINANCE CLIENT",
      message: "Starting websocket to update account balance",
    });
    this.client.websockets.userData(
      (update: updateBalanceWsDTO) => {
        switch (update.e) {
          case "outboundAccountPosition":
            const parsedBalance = BalanceParser.parse(update);
            balanceCallback(parsedBalance);
            break;
          case "executionReport":
            const parsedOrder = OrderParser.parse(update);
            orderCallback(parsedOrder);
            break;
        }
      },
      () => {}
    );
  }

  async createWsCandleStickUpdate({
    pair,
    interval = "5m",
    updateCallback,
  }: {
    pair: Pairs;
    interval: CandleInterval;
    updateCallback: (candlestick: Candlestick) => void;
  }) {
    logger.log({
      from: "BINANCE CLIENT",
      message: "Starting websocket to update pair candlestick",
    });
    this.client.websockets.candlesticks(
      pair,
      interval,
      (candlestickData: CandleWsResponseDTO) => {
        const candlestick = CandlestickParser.parse(candlestickData);
        updateCallback(candlestick);
      }
    );
  }
}

export default BinanceClient;
