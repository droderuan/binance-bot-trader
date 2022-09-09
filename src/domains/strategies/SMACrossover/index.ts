import { CandleStickReference, Candlestick, Window } from "../../../types/Candle";
import logger from "../../../utils/logger";
import { GenericStrategy, StrategyDecision } from "./../types/GenericStrategy";
import SMA from "../../indicators/arithmeticModels/SMA";
import { Position } from "../../observer/Referee";

export interface SmaCrossOverConfig {
  slower: {
    window: Window
    reference: {
      toBuy: CandleStickReference,
      toSell: CandleStickReference
    }
  }
  faster: {
    window: Window
    reference: {
      toBuy: CandleStickReference,
      toSell: CandleStickReference
    }
  }
}

export class SmaCrossover extends GenericStrategy {
  private faster: SMA = null as any
  private slower: SMA = null as any
  private params!: SmaCrossOverConfig

  updateCandleReference(position: Position) {
    const fasterModelConfig = this.params.faster.reference
    const slowerModelConfig = this.params.slower.reference

    const referenceFaster = position === 'BOUGHT' ? fasterModelConfig.toSell : fasterModelConfig.toBuy
    const referenceSlower = position === 'BOUGHT' ? slowerModelConfig.toSell : slowerModelConfig.toBuy

    this.faster.setReferenceValue(referenceFaster)
    this.slower.setReferenceValue(referenceSlower)
  }

  config(initialValues: Candlestick[], params: SmaCrossOverConfig) {
    if (!params.faster || !params.slower) {
      throw new Error("Undefined params");
    }

    logger.log({ from: 'STRATEGIE', message: `SMA Crossover - initializing` })

    this.params = params

    this.faster = new SMA()
    this.faster.config({ initialValues, window: params.faster.window, log: false })

    this.slower = new SMA()
    this.slower.config({ initialValues, window: params.slower.window, log: false })

    logger.log({ from: 'STRATEGIE', message: `SMA Crossover - initialized` })

  }

  decision() {
    const currentFasterSmaValue = this.faster.lastSma()
    const currentSlowerSmaValue = this.slower.lastSma()

    if (currentFasterSmaValue > currentSlowerSmaValue) {
      return 'TO_BUY'
    }
    if (currentFasterSmaValue < currentSlowerSmaValue) {
      return 'TO_SELL'
    }
    return 'NOTHING'
  }

  async update(newCandle: Candlestick) {
    this.faster.update(newCandle, false)
    this.slower.update(newCandle, false)
    this.log()
  }

  log() {
    const currentFasterSmaValue = this.faster.currentSMA()
    const currentSlowerSmaValue = this.slower.currentSMA()

    logger.log({ from: 'STRATEGIE', message: `SMA Crossover` })
    logger.log({ from: 'STRATEGIE', message: `current faster SMA \t${currentFasterSmaValue}` })
    logger.log({ from: 'STRATEGIE', message: `current slower SMA \t${currentSlowerSmaValue}` })
  }
}