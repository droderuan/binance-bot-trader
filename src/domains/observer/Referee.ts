import { StrategyDecision } from "../strategies/types/GenericStrategy"
import logger from "../../utils/logger"
import OrderEventEmitter from "../event/Event"

export type Position = 'BOUGHT' | 'EMPTY'

class Referee {
  orderEventEmitter: OrderEventEmitter
  currentPosition: Position

  constructor(currentPosition: Position, order: OrderEventEmitter) {
    this.orderEventEmitter = order
    this.currentPosition = currentPosition
  }

  judge(decision: StrategyDecision) {
    switch(decision){
      case('TO_BUY'):
        this.emitBuyOrder()
        break
      case('TO_SELL'):
        this.emitSellOrder()
        break
      default:
        logger.log({from: 'REFEREE', message: 'Doing nothing...'})
        break
    }
  }

  updatePosition(currentPosition: Position) {
    this.currentPosition = currentPosition
  }

  emitBuyOrder() {
    if (this.currentPosition === 'BOUGHT') {
      // logger.log({from: 'REFEREE', message: `Already in BOUGHT`})
      // logger.log({from: 'REFEREE', message: 'Doing nothing...'})
      return
    }
    this.orderEventEmitter.emitter('BUY')
    logger.log({from: 'REFEREE', message: `Position: ${this.currentPosition}`})
  }

  emitSellOrder() {
    if (this.currentPosition === 'EMPTY') {
      // logger.log({from: 'REFEREE', message: `Already in EMPTY`})
      return
   }
   this.orderEventEmitter.emitter('SELL')
   logger.log({from: 'REFEREE', message: `Position: ${this.currentPosition}`})
  }

  reverse() {
    this.currentPosition = this.currentPosition === 'BOUGHT' ? 'EMPTY' : 'BOUGHT'
  }
}

export default Referee