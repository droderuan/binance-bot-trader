import { SimpleSmaConfig } from "../strategies/SimpleSMA";
import { SmaCrossOverConfig } from "../strategies/SMACrossover";
import { CandleInterval } from "../../types/Candle";
import { Pairs } from "../../types/Pair";

import { Position } from "../observer/Referee";
import { Strategies } from "../strategies/types";

interface SimpleSMA {
  name: "Simple SMA",
  config: SimpleSmaConfig
}

interface SMACrossover {
  name: "SMA Crossover",
  config: SmaCrossOverConfig
}

export type StrategieConfig = SimpleSMA | SMACrossover

interface BotConfigParams {
  pair: Pairs
  strategy: StrategieConfig
  candleSize: CandleInterval
  startPosition?: Position
}

class BotConfig {
  config: BotConfigParams

  constructor(config: BotConfigParams) {
    this.config = config
  }
}

export default BotConfig