import { Candlestick, CandleStickReference, Window } from "../../../types/Candle";
import logger from "../../../utils/logger";
import SMA from "../../indicators/arithmeticModels/SMA";
import { Position } from "../../observer/Referee";
import { GenericStrategy } from "../types";

export interface SMALocalMinimumConfig {
  window: Window
  range: 3 | 5 | 7 | 9
  reference: {
    toBuy: CandleStickReference,
    toSell: CandleStickReference
  }
}

export class SMALocalMinimum extends GenericStrategy {
  sma: SMA = null as any
  params!: SMALocalMinimumConfig

  config(initialValues: Candlestick[], params: SMALocalMinimumConfig) {
    logger.log({ from: 'STRATEGIE', message: `Simple SMA - initialized` })

    this.sma = new SMA()
    this.sma.config({ initialValues, window: params.window })
    this.params = params

    logger.log({ from: 'STRATEGIE', message: `Simple SMA - initialized` })
  }

  private checkShapeOfSMA() {
    const lastSma = this.sma.smaValues.length - 1
    const setOfSmaValues = this.sma.smaValues.slice((lastSma - this.params.range + 1), lastSma + 1)

    const middleValue = Math.floor(setOfSmaValues.length / 2)
    const min = Math.min(...setOfSmaValues)
    const max = Math.max(...setOfSmaValues)

    const indexOfMin = setOfSmaValues.indexOf(min)
    const indexOfMax = setOfSmaValues.indexOf(max)

    if (indexOfMax === middleValue) {
      return 'convex'
    } else if (indexOfMin === middleValue) {
      return 'concave'
    } else {
      return 'no curve'
    }
  }

  decision() {
    const shapeOfSma = this.checkShapeOfSMA()
    if (shapeOfSma === 'convex') {
      return 'TO_BUY'
    } else if (shapeOfSma === 'concave') {
      return 'TO_SELL'
    }
    return 'NOTHING'
  }

  async update(newCandle: Candlestick) {
    this.sma.update(newCandle, false)
    this.log()
  }

  updateCandleReference(position: Position) {
    const reference = position === 'BOUGHT' ? this.params.reference.toSell : this.params.reference.toBuy

    this.sma.setReferenceValue(reference)
  }

  log() {
    const currentFasterSmaValue = this.sma.currentSMA(this.params.range)

    logger.log({ from: 'STRATEGIE', message: `SMA Crossover` })
    logger.log({ from: 'STRATEGIE', message: `current faster SMA \t${currentFasterSmaValue}` })
    logger.log({ from: 'STRATEGIE', message: `current shape ${this.checkShapeOfSMA()}` })
  }
}
