import { PairInfo } from "../../types/Pair";
import logger from "../../utils/logger";
import { Strategies } from "../strategies/types";

export type OrderEmitterTypes = 'BUY' | 'SELL' | 'REVERT'

export interface BuyOrderEvent {
  type: 'BUY',
  params: {
    pair: PairInfo
    quantity: number
    strategy: Strategies
  }
}

export interface SellOrderEvent {
  type: 'SELL',
  params: {
    pair: PairInfo
    quantity: number
    strategy: Strategies
  }
}

export interface RevertEvent {
  type: 'REVERT',
  params: {
    reason: string
    strategy: Strategies
  }
}

type Event = BuyOrderEvent | SellOrderEvent | RevertEvent

type Listeners = {
  'BUY': ((event: BuyOrderEvent) => void)[]
  'SELL': ((event: SellOrderEvent) => void)[]
  'REVERT': ((event: RevertEvent) => void)[]
}

export interface setBuyListener {
  event: 'BUY'
  execute: (event: BuyOrderEvent) => void
}

export interface setSellListener {
  event: 'SELL'
  execute: (event: SellOrderEvent) => void
}

export interface setRevertListener {
  event: 'REVERT'
  execute: (event: RevertEvent) => void
}

class OrderEventEmitter {
  private listeners: Listeners = {} as Listeners

  constructor(){
    this.listeners = {
      BUY: [],
      SELL: [],
      REVERT: []
    }
  }

  setListener(params: setBuyListener | setSellListener | setRevertListener) {
    this.listeners[params.event].push(params.execute as any)
  }

  emitter(event: OrderEmitterTypes){
    logger.log({from: 'EVENT', message: `${event}`, bold: true})
    this.listeners[event].forEach(action => action(event))
  }
}

export default OrderEventEmitter