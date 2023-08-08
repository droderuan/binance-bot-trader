import { Candlestick, CandleStickReference, Window } from "../../../../types/Candle"
import logger from "../../../../utils/logger"
import { SimpleSmaConfig } from "../../../strategies/SimpleSMA"

export interface SmaConfig {
  initialValues: Candlestick[]
  window: Window
  log?: boolean
}

class SMA {
  private candles: Candlestick[] = []
  private window: number = 0
  private step: number = 0
  private candleReferenceValue: CandleStickReference = 'closePrice'
  smaValues: number[] = []
  private log = false

  config({ initialValues, window, log = false }: SmaConfig) {
    this.log && logger.log({ from: 'INDICATOR', message: `SMA - initializing` })
    this.candles = initialValues
    this.window = window
    this.step = window - 1
    this.log = log
    this.initialCalculate()

    this.log && logger.log({ from: 'INDICATOR', message: `SMA - initialized` })
  }

  private calculate(index: number) {
    const startInterval = index - this.step
    const endInterval = index + 1
    const intervalValues = this.candles.slice(startInterval, endInterval)
    return intervalValues.reduce((total, curr) => total + curr[this.candleReferenceValue], 0) / this.window
  }

  private initialCalculate() {
    if (this.candles.length < this.window) {
      throw new Error(`Not enough data for a ${this.window} window`)
    }

    this.smaValues = this.candles.map((_, index) => {
      if (index < this.step) {
        return 0
      }
      return this.calculate(index)
    })
  }

  getCandleReference() {
    return this.candleReferenceValue
  }

  setReferenceValue(referenceValue: CandleStickReference) {
    this.candleReferenceValue = referenceValue
    this.initialCalculate()
  }

  update(newCandle: Candlestick, log = true) {
    this.log && logger.log({ from: 'INDICATOR', message: `SMA - updating model...` })

    let lastIndex = this.candles.length - 1
    let lastCandle = this.candles[lastIndex]

    if (lastCandle.startedAt === newCandle.startedAt) {
      this.updateLastSma({ newCandle, lastCandleIndex: lastIndex })
    } else {
      this.updateSma({ newCandle, lastCandleIndex: lastIndex })
    }
    log && this.logUpdates()
  }

  updateLastSma({ newCandle, lastCandleIndex }: { newCandle: Candlestick, lastCandleIndex: number }) {
    let lastCandle = this.candles[lastCandleIndex]
    if (lastCandle[this.candleReferenceValue] === newCandle[this.candleReferenceValue]) {
      this.log && logger.log({ from: 'INDICATOR', message: `SMA - no changes` })
      return
    } else {
      this.candles[lastCandleIndex] = newCandle
      const smaValue = this.calculate(lastCandleIndex)
      const lastSmaIndex = this.smaValues.length - 1
      this.smaValues[lastSmaIndex] = smaValue

      this.log && logger.log({ from: 'INDICATOR', message: `SMA - last candle[${this.candleReferenceValue}] value ${newCandle[this.candleReferenceValue]}` })
      this.log && logger.log({ from: 'INDICATOR', message: `SMA - last sma value ${smaValue}` })
    }
  }

  updateSma({ newCandle, lastCandleIndex }: { newCandle: Candlestick, lastCandleIndex: number }) {
    this.candles = this.candles.slice(1,)
    this.candles.push(newCandle)

    const currentSMAValue = this.calculate(lastCandleIndex)
    this.smaValues = this.smaValues.slice(1)
    this.smaValues.push(currentSMAValue)

    this.log && logger.log({ from: 'INDICATOR', message: `SMA - last candle[${this.candleReferenceValue}] value ${newCandle[this.candleReferenceValue]}` })
    this.log && logger.log({ from: 'INDICATOR', message: `SMA - last sma value ${currentSMAValue}` })
  }

  lastSma() {
    return this.smaValues[this.smaValues.length - 1]
  }

  lastCandle() {
    return this.candles[this.candles.length - 1]
  }

  currentSMA(lastValues: number = 5) {
    const current = this.smaValues.slice(this.smaValues.length - lastValues)

    return current.join(' - ')
  }

  logUpdates() {
    const currentCandle = this.candles.slice(this.smaValues.length - 5)

    const parsed = currentCandle.reduce((str, candle) => {
      return str.length > 1 ? `${str} - ${candle[this.candleReferenceValue]}` : String(candle[this.candleReferenceValue])
    }, '')

    this.log && logger.log({ from: 'INDICATOR', message: `SMA - using ${this.candleReferenceValue} price` })
    this.log && logger.log({ from: 'INDICATOR', message: `SMA - last 5 SMA values \t${this.currentSMA()}` })
    this.log && logger.log({ from: 'INDICATOR', message: `SMA - last 5 pair prices \t${parsed}` })
    this.log && logger.log({ from: 'INDICATOR', message: `SMA - last candle ${this.candleReferenceValue}:  \t${currentCandle[currentCandle.length - 1][this.candleReferenceValue]}` })
  }
}

export default SMA
