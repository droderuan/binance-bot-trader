import { Candlestick } from "../../../types/Candle"
import { Position } from "../../observer/Referee"

export type StrategyDecision = 'TO_BUY' | 'TO_SELL' | 'NOTHING'

export abstract class GenericStrategy {
  abstract config(...params: any): void

  abstract log(): void

  abstract update(newCandle: Candlestick): void

  abstract decision(): StrategyDecision

  abstract updateCandleReference(position: Position): void
}

export type Strategies = 'Simple SMA' | 'SMA Crossover'