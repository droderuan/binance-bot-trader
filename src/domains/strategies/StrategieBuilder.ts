import strategies from ".";
import { binanceClient } from "../../main";
import { CandleInterval, Window } from "../../types/Candle";
import { Pairs } from "../../types/Pair";
import AppError from "../../utils/AppError";
import logger from "../../utils/logger";
import { StrategieConfig } from "../app/BotConfig";

interface StrategieBuilderParams {
  strategieConfig: StrategieConfig,
  pair: Pairs
  candleSize: CandleInterval
}

export class StrategieBuilder {
  private pair!: Pairs
  private candleSize!: CandleInterval

  async build({ strategieConfig, pair, candleSize }: StrategieBuilderParams) {
    this.pair = pair
    this.candleSize = candleSize
    logger.log({ from: 'STRATEGIE BUILDER', message: `Building strategy ${strategieConfig.name}` })

    const strategy = await this.buildStrategie(strategieConfig)

    if (strategy === undefined) {
      throw new AppError('STRATEGIE BUILDER', `Strategie ${strategieConfig.name} could not be started`)
    }

    logger.log({ from: 'STRATEGIE BUILDER', message: 'Build finish' })
    return strategy
  }

  private async buildStrategie(strategieConfig: StrategieConfig) {
    if (strategieConfig.name === 'Simple SMA') {
      const Strategie = strategies[strategieConfig.name]
      const candle = await this.getHistoricalCandleStick(strategieConfig.config.window)
      const appStrategie = new Strategie()
      appStrategie.config(candle, strategieConfig.config)
      return appStrategie
    } else if (strategieConfig.name === 'SMA Crossover') {
      const Strategie = strategies[strategieConfig.name]
      const candle = await this.getHistoricalCandleStick(strategieConfig.config.slower.window)
      const appStrategie = new Strategie()
      appStrategie.config(candle, strategieConfig.config)
      return appStrategie
    } else if (strategieConfig.name === 'SMA Local Minimum') {
      const Strategie = strategies[strategieConfig.name]
      const candle = await this.getHistoricalCandleStick(strategieConfig.config.window)
      const appStrategie = new Strategie()
      appStrategie.config(candle, strategieConfig.config)
      return appStrategie
    }
  }

  private async getHistoricalCandleStick(window: Window) {
    logger.log({ from: 'STRATEGIE BUILDER', message: 'Loading historical candlestick data' })

    const candles = await binanceClient.getHistorical({
      pair: this.pair,
      interval: this.candleSize,
      window: window
    })
    if (!candles) {
      logger.log({ from: 'STRATEGIE BUILDER', message: 'Error while loading initial data' })
      throw Error('No initial candle')
    }
    return candles
  }
}
