import {
  CandleStickReference,
  Candlestick,
  Window,
} from "../../../types/Candle";
import logger from "../../../utils/logger";
import { GenericStrategy } from "./../types/GenericStrategy";
import SMA from "../../indicators/arithmeticModels/SMA";
import { Position } from "../../observer/Referee";

export interface SmaCrossOverConfig {
  boxTolerance: number;
  slower: {
    window: Window;
    reference: {
      toBuy: CandleStickReference;
      toSell: CandleStickReference;
    };
  };
  faster: {
    window: Window;
    reference: {
      toBuy: CandleStickReference;
      toSell: CandleStickReference;
    };
  };
}

export class SmaCrossover extends GenericStrategy {
  private faster: SMA = null as any;
  private slower: SMA = null as any;
  private params!: SmaCrossOverConfig;

  updateCandleReference(position: Position) {
    const fasterModelConfig = this.params.faster.reference;
    const slowerModelConfig = this.params.slower.reference;

    const referenceFaster =
      position === "BOUGHT"
        ? fasterModelConfig.toSell
        : fasterModelConfig.toBuy;
    const referenceSlower =
      position === "BOUGHT"
        ? slowerModelConfig.toSell
        : slowerModelConfig.toBuy;

    this.faster.setReferenceValue(referenceFaster);
    this.slower.setReferenceValue(referenceSlower);
  }

  config(initialValues: Candlestick[], params: SmaCrossOverConfig) {
    if (!params.faster || !params.slower) {
      throw new Error("Undefined params");
    }

    if (params.boxTolerance < 0 && params.boxTolerance > 100) {
      throw new Error("forbidden boxLimitTolerance");
    }

    logger.log({ from: "STRATEGIE", message: `SMA Crossover - initializing` });

    this.params = params;

    this.faster = new SMA();
    this.faster.config({
      initialValues,
      window: params.faster.window,
      log: false,
    });

    this.slower = new SMA();
    this.slower.config({
      initialValues,
      window: params.slower.window,
      log: false,
    });

    logger.log({
      from: "STRATEGIE",
      message: `SMA Crossover - params boxTolerance=${this.params.boxTolerance} faster.window=${this.params.faster.window} slower.window=${this.params.slower.window}`,
    });
    logger.log({ from: "STRATEGIE", message: `SMA Crossover - initialized` });
  }

  decision() {
    const currentFasterSmaValue = this.faster.lastSma();
    const currentSlowerSmaValue = this.slower.lastSma();

    const smaPercentageDiff = this.calculateAbsolutePercentageDifference(
      currentFasterSmaValue,
      currentSlowerSmaValue
    );

    logger.log({
      from: "STRATEGIE",
      message: `SMA Crossover - box tolerance ${smaPercentageDiff}%`,
    });

    if (smaPercentageDiff <= this.params.boxTolerance) {
      return "NOTHING";
    }

    if (currentFasterSmaValue > currentSlowerSmaValue) {
      return "TO_BUY";
    }

    if (currentFasterSmaValue < currentSlowerSmaValue) {
      return "TO_SELL";
    }

    return "NOTHING";
  }

  private calculateAbsolutePercentageDifference(
    numberA: number,
    numberB: number
  ): number {
    if (numberB === 0) {
      throw new Error(
        "SmaCrossOver cannot calculate percentage difference relative to zero."
      );
    }
    const percentDiff = Math.abs((numberA - numberB) / numberB) * 100;

    return Number(percentDiff.toFixed(2));
  }

  async update(newCandle: Candlestick) {
    this.faster.update(newCandle, false);
    this.slower.update(newCandle, false);
    this.log();
  }

  log() {
    const currentFasterSmaValue = this.faster.currentSMA();
    const currentSlowerSmaValue = this.slower.currentSMA();

    logger.log({ from: "STRATEGIE", message: `SMA Crossover` });
    logger.log({
      from: "STRATEGIE",
      message: `current faster SMA \t${currentFasterSmaValue}`,
    });
    logger.log({
      from: "STRATEGIE",
      message: `current slower SMA \t${currentSlowerSmaValue}`,
    });
  }
}
