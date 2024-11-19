import BinanceApi, {
  Binance,
  Candle,
  OrderType,
  UserDataStreamEvent,
} from "binance-api-node";
import { CandleInterval, Candlestick, Window } from "../../../types/Candle";
import { Pairs } from "../../../types/Pair";
import { Order } from "../../../types/Order";
import { PairInfo } from "../../../types/Pair";
import logger from "../../../utils/logger";

import { CandlestickParser } from "./parsers/CandleParser";
import { SymbolParser } from "./parsers/SymbolParser";
import { OrderParser } from "./parsers/OrderParser";
import { BalanceParser } from "./parsers/BalanceParser";

import { Balance } from "../../services/WalletUserService";

interface historicalParams {
  pair: Pairs;
  interval: CandleInterval;
  window?: Window;
}

class BinanceClient {
  client: Binance;
  useServerTime = true;

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
    const client = BinanceApi({
      apiKey: apiKey,
      apiSecret: apiSecret,
    });

    this.client = client;
  }

  async getHistorical({
    pair,
    interval = "5m",
    window = 20,
  }: historicalParams): Promise<Candlestick[]> {
    logger.log({
      from: "BINANCE CLIENT",
      message: `getting historical price of ${pair}`,
    });

    const candles = await this.client.candles({
      symbol: pair,
      interval,
      limit: window * 2,
    });

    const parsedTicks = CandlestickParser.parseHistorical(
      pair,
      interval,
      candles
    );

    return parsedTicks;
  }

  async currentPrice(pair: Pairs): Promise<number> {
    const currentPrice = await this.client.prices({ symbol: pair });
    return parseFloat(currentPrice[pair]);
  }

  async wait(cb: any) {
    this.client.time().then(cb);
  }

  async currentBalance(pairs: string[]): Promise<Balance> {
    const accountBalance = await this.client.accountInfo({
      useServerTime: this.useServerTime,
    });

    const parsedBalance = BalanceParser.parseCurrentBalance(
      pairs,
      accountBalance
    );

    return parsedBalance;
  }

  async createBuyOrder(
    pair: Pairs,
    quantity: number,
    price: number
  ): Promise<Order> {
    logger.log({ from: "BINANCE CLIENT", message: `Creating a buy order` });

    const order = await this.client.order({
      type: OrderType.LIMIT,
      symbol: pair,
      quantity: String(quantity),
      price: String(price),
      side: "BUY",
      useServerTime: this.useServerTime,
    });

    const parsedOrder = OrderParser.parsePairOrder(order);

    logger.log({ from: "BINANCE CLIENT", message: `Buy order created` });
    logger.log({
      from: "BINANCE CLIENT",
      message: `Buy order: ${parsedOrder.id}`,
    });

    return parsedOrder;
  }

  async createSellOrder(
    pair: Pairs,
    quantity: number,
    price: number
  ): Promise<Order> {
    logger.log({ from: "BINANCE CLIENT", message: `Creating a sell order` });

    const order = await this.client.order({
      quantity: String(quantity),
      price: String(price),
      side: "SELL",
      type: OrderType.LIMIT,
      symbol: pair,
      useServerTime: this.useServerTime,
    });

    const parsedOrder = OrderParser.parsePairOrder(order);

    logger.log({ from: "BINANCE CLIENT", message: `Sell order created` });
    logger.log({
      from: "BINANCE CLIENT",
      message: `Sell order: ${parsedOrder.id}`,
    });

    return parsedOrder;
  }

  async orderStatus(order: Order): Promise<Order> {
    logger.log({
      from: "BINANCE CLIENT",
      message: `Checking order status: ${order.id}`,
    });
    const orderStatus = await this.client.getOrder({
      symbol: order.pair,
      orderId: order.id,
      useServerTime: this.useServerTime,
    });
    const parsedOrder = OrderParser.parsePairOrder(orderStatus);

    return parsedOrder;
  }

  async cancelOrder(order: Order): Promise<void> {
    logger.log({
      from: "BINANCE CLIENT",
      message: `Canceling order ${order.id}`,
    });

    await this.client.cancelOrder({
      orderId: order.id,
      symbol: order.pair,
      useServerTime: this.useServerTime,
    });

    logger.log({
      from: "BINANCE CLIENT",
      message: `Order canceled: ${order.id}`,
    });
    return;
  }

  async lastOrder(pair: Pairs): Promise<Order | null> {
    const orders = await this.client.allOrders({
      symbol: pair,
      limit: 1,
      useServerTime: this.useServerTime,
    });

    if (orders.length === 0) {
      return null;
    }

    const parsedOrder = OrderParser.parsePairOrder(orders[0]);
    return parsedOrder;
  }

  async PairInfo(pair: Pairs): Promise<PairInfo> {
    const response = await this.client.exchangeInfo({ symbol: pair });
    return SymbolParser.parse(response)[0];
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
    this.client.ws.user((update: UserDataStreamEvent) => {
      switch (update.eventType) {
        case "outboundAccountPosition":
          const parsedBalance = BalanceParser.parse(update);
          balanceCallback(parsedBalance);
          break;
        case "executionReport":
          const parsedOrder = OrderParser.parse(update);
          orderCallback(parsedOrder);
          break;
      }
    });
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
    this.client.ws.candles(pair, interval, (candlestickData: Candle) => {
      const candlestick = CandlestickParser.parse(candlestickData);
      updateCallback(candlestick);
    });
  }
}

export default BinanceClient;
