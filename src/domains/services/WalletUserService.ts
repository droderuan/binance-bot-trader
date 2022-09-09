import BinanceClient from "../client/binance/Binance";
import logger from "../../utils/logger";
import { PairInfo, Pairs } from "../../types/Pair";
import { Order } from "../../types/Order";
import { binanceClient } from '../../main';
import AppError from "../../utils/AppError";

interface WalletConfig {
  pair: PairInfo,
  orderUpdateCallback?: (order: Order) => void
}

export interface Balance {
  [key: string]: {
    available: number,
    onOrder: number
  }
}

interface CurrentBalance {
  coin: string
  available: number
  onOrder: number
}

class UserWalletService {
  private balanceToBuy: CurrentBalance = {} as CurrentBalance
  private balanceToSell: CurrentBalance = {} as CurrentBalance
  private PairInfo: PairInfo = {} as PairInfo
  private lastOrder!: Order
  private orderUpdateCallback: ((order: Order) => void) | undefined

  constructor(config: WalletConfig) {
    this.PairInfo = config.pair
    this.orderUpdateCallback = config.orderUpdateCallback
  }

  async getInitialBalance() {
    try {
      const balanceResponse = await binanceClient.currentBalance([this.PairInfo.buyCoin, this.PairInfo.sellCoin]);
      this.balanceUpdate(balanceResponse)
    } catch (err) {
      if (err instanceof AppError) {
        logger.log({ from: 'WALLET', message: `Error - ${err.message}` })
      }
      logger.log({ from: 'WALLET', message: 'while updating balance', type: 'ERROR' })
    }
  }

  startBalanceAndOrderUpdate() {
    binanceClient.createWsBalanceAndOrderUpdate({
      balanceCallback: (balance) => this.balanceUpdate(balance),
      orderCallback: (order) => this.orderUpdate(order)
    })
  }

  private balanceUpdate(balances: Balance) {
    let logBalance = false
    if (balances[this.PairInfo.buyCoin]) {
      this.balanceToBuy = {
        ...balances[this.PairInfo.buyCoin],
        coin: this.PairInfo.buyCoin
      }
      logBalance = true
    }

    if (balances[this.PairInfo.sellCoin]) {
      this.balanceToSell = {
        ...balances[this.PairInfo.sellCoin],
        coin: this.PairInfo.sellCoin
      }
      logBalance = true
    }

    logBalance && this.balanceUpdateLog()
  }

  private orderUpdate(order: Order) {
    if (order.pair === this.PairInfo.pair) {
      this.lastOrder = order
      this.orderUpdateLog()
      this.orderUpdateCallback && this.orderUpdateCallback(order)
    }

  }

  getBalance() {
    return { toBuy: this.balanceToBuy, toSell: this.balanceToSell }
  }

  async getLastOrder() {
    return this.lastOrder ? this.lastOrder : binanceClient.lastOrder(this.PairInfo.pair)
  }

  balanceUpdateLog() {
    logger.log({
      from: 'WALLET',
      message: `BALANCE - coin: ${this.balanceToBuy.coin} \tavailable: ${this.balanceToBuy.available} \tonOrder: ${this.balanceToBuy.onOrder}`
    })
    logger.log({
      from: 'WALLET',
      message: `BALANCE - coin: ${this.balanceToSell.coin} \tavailable: ${this.balanceToSell.available} \tonOrder: ${this.balanceToSell.onOrder}`
    })
  }

  private orderUpdateLog() {
    logger.log({
      from: 'WALLET',
      message: `ORDER - id: ${this.lastOrder.id} execution \ttype: ${this.lastOrder.currentExecutionType} \tprice: ${this.lastOrder.price} \tquantity: ${this.lastOrder.quantity}`
    })
    logger.log({
      from: 'WALLET',
      message: `ORDER - status: ${this.lastOrder.status} \tside: ${this.lastOrder.side}`
    })
  }
}

export default UserWalletService