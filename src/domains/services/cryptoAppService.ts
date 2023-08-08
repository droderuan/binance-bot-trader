import OrderEventEmitter from "../event/Event";
import Referee, { Position } from "../observer/Referee";
import { binanceClient } from "../../main";
import { PairInfo, Pairs } from "../../types/Pair";
import AppError from "../../utils/AppError";
import logger from "../../utils/logger";
import BotConfig from "../app/BotConfig";
import { GenericStrategy } from "../strategies/types";
import UserWalletService from "./WalletUserService";
import OrderService from "./OrderService";
import { Order } from "../../types/Order";

class CryptoAppService {
  private botConfig!: BotConfig
  private strategy!: GenericStrategy
  private pair!: PairInfo
  private wallet!: UserWalletService
  private referee!: Referee
  private orderEvent!: OrderEventEmitter
  private orderService!: OrderService
  private orderLock = false
  private position!: Position
  private orderUpdateTries = 1
  private maxOrderUpdateTries = 5

  private test = false

  private buyPrice = 0
  private sellPrice = 0

  async init() {
    this.wallet = new UserWalletService({
      pair: this.pair,
    })
    let currentPosition = this.botConfig.config.startPosition
    this.test = this.botConfig.config.test || false

    if (!currentPosition) {
      logger.log({ from: 'CRYPTO APP', message: 'No start position detected - looking for the last order...' })
      const lastCandle = await this.wallet.getLastOrder()
      if (!lastCandle) {
        currentPosition = 'EMPTY'
      } else {
        if (lastCandle.status !== 'FILLED') throw new AppError('Getting initial position', `Last candle status: ${lastCandle.status}. Unable to set inicial position. Set manually on bot config.`)
        currentPosition = lastCandle.side === 'BUY' ? 'BOUGHT' : 'EMPTY'
      }
      logger.log({ from: 'CRYPTO APP', message: `Using start position: ${currentPosition}` })
    }

    this.position = currentPosition

    this.referee = new Referee(currentPosition, this.orderEvent)
    this.strategy.updateCandleReference(currentPosition)

    await this.wallet.getInitialBalance()
    this.wallet.startBalanceAndOrderUpdate()
    this.startUpdateStrategie()

    this.orderEvent.setListener({ event: 'BUY', execute: () => this.buy() })
    this.orderEvent.setListener({ event: 'SELL', execute: () => this.sell() })

    this.routineLog()
  }

  setConfig(config: BotConfig) {
    this.botConfig = config
  }

  setOrderEvent(orderEvent: OrderEventEmitter) {
    this.orderEvent = orderEvent
  }

  setOrderService(orderService: OrderService) {
    this.orderService = orderService
  }

  async setPairInfo(pair: Pairs) {
    logger.log({ from: 'CRYPTO APP', message: 'Getting pair info' })
    try {
      const PairInfo = await binanceClient.PairInfo(pair)
      this.pair = PairInfo
    } catch (err) {
      throw new AppError('CRYPTO_SERVICE', 'Error on get pair info')
    }
  }

  getPair() {
    return this.pair
  }

  async setStrategie(strategy: GenericStrategy) {
    this.strategy = strategy
  }

  startUpdateStrategie() {
    logger.log({ from: 'CRYPTO APP', message: 'Initializing strategy update' })
    binanceClient.createWsCandleStickUpdate({
      pair: this.pair.pair,
      interval: this.botConfig.config.candleSize,
      updateCallback: async (candle) => {
        this.strategy.update(candle)
        const decision = this.strategy.decision()
        this.referee.judge(decision)
      }
    })
  }

  async buy() {
    if (!this.orderLock) {
      try {
        if (!this.test) {
          const buyPrice = await this.orderService.createBuyOrder({
            PairInfo: this.pair,
            quantity: this.wallet.getBalance().toBuy.available
          })
          this.orderLock = true
          this.buyPrice = buyPrice || 0
          await this.checkLastOrderIsFilled()
        }
        this.referee.updatePosition('BOUGHT')
      } catch (err) {
        console.log(err)
        this.orderLock = false
      }
    } else {
      logger.log({ from: 'CRYPTO APP', message: 'On order lock. Waiting current order to finish', bold: true })
    }
  }

  async sell() {
    if (!this.orderLock) {
      try {
        if (!this.test) {

          const sellPrice = await this.orderService.createSellOrder({
            PairInfo: this.pair,
            quantity: this.wallet.getBalance().toSell.available
          })
          this.orderLock = true
          this.sellPrice = sellPrice || 0
          await this.checkLastOrderIsFilled()
          this.calculateProfit()
        }
        this.referee.updatePosition('EMPTY')
      } catch (err) {
        console.log(err)
        this.orderLock = false
      }
    } else {
      const lastOrder = await this.wallet.getLastOrder()
      if (!lastOrder) return
      logger.log({ from: 'CRYPTO APP', message: 'On order lock. Waiting current order to finish' })
      logger.log({ from: 'CRYPTO APP', message: `Order: ${lastOrder.id} status: ${lastOrder.status} side: ${lastOrder.side}` })
    }
  }

  async calculateProfit() {
    if (this.buyPrice !== 0 && this.sellPrice !== 0) {
      const diff = (this.sellPrice / this.buyPrice) * 100
      const percent = `${parseFloat(String(diff)).toFixed(3)}%`
      logger.log({ from: 'CRYPTO APP', message: `SELLING ON ${diff > 100 ? 'PROFIT' : 'LOST'} of ${percent}`, type: diff > 100 ? 'SUCCESS' : 'ERROR' })
    }
  }

  async checkLastOrderIsFilled() {
    const interval = setInterval(async () => {
      const lastOrder = await this.wallet.getLastOrder()

      if (!lastOrder) return

      if (lastOrder.status === 'FILLED') {
        logger.log({ from: 'CRYPTO APP', message: `Order filled: ${lastOrder.id}`, type: 'SUCCESS' })
        clearInterval(interval)
        this.orderLock = false
        this.orderUpdateTries = 1
      } else {
        logger.log({ from: 'CRYPTO APP', message: `Order update tries: ${this.orderUpdateTries}` })

        if (this.orderUpdateTries >= this.maxOrderUpdateTries) {
          logger.log({ from: 'CRYPTO APP', message: `Max order update tries achieved`, bold: true })
          logger.log({ from: 'CRYPTO APP', message: `Canceling order: ${lastOrder.id}`, type: 'SUCCESS' })

          try {
            await binanceClient.cancelOrder(lastOrder)
            this.referee.reverse()
            this.orderEvent.emitter('REVERT')
          } catch (err) {
            logger.log({ from: 'CRYPTO APP', message: 'While trying to cancel order. Considering it is filled', type: 'ERROR' })
          } finally {
            this.orderLock = false
            this.orderUpdateTries = 1
          }
        } else {
          ++this.orderUpdateTries
        }
      }
    }, 5000)
  }

  routineLog() {
    setTimeout(async () => {
      try {
        const lastOrder = await this.wallet.getLastOrder()
        const currentPrice = await binanceClient.currentPrice(this.pair.pair)
        if (!lastOrder) return

        const position = this.referee.currentPosition

        this.wallet.balanceUpdateLog()
        logger.log({ from: 'CRYPTO APP', message: `Using ${this.pair.pair}` })
        logger.log({ from: 'CRYPTO APP', message: `Price ${currentPrice}` })
        logger.log({ from: 'CRYPTO APP', message: `Logging last Order:` })
        logger.log({ from: 'CRYPTO APP', message: `Status: ${lastOrder.status} \tside: ${lastOrder.side}` })
        logger.log({ from: 'CRYPTO APP', message: `quantity: ${lastOrder.quantity} \tprice: ${lastOrder.price}` })
        logger.log({ from: 'REFEREE', message: `Current Position: ${position}` })
        logger.log({ from: 'CRYPTO APP', message: `Next log in 20s` })
      } catch (err) {
        logger.log({ from: 'CRYPTO APP', message: `Error on routine log`, type: 'ERROR' })
      } finally {
        setTimeout(() => this.routineLog(), 20000)
      }
    }, 60000)
  }
}

export default CryptoAppService
