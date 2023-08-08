import { SimpleSmaConfig } from "../strategies/SimpleSMA";
import { SmaCrossOverConfig } from "../strategies/SMACrossover";
import { SMALocalMinimumConfig } from "../strategies/SMALocalMinimum";
import { CandleInterval } from "../../types/Candle";
import { Pairs } from "../../types/Pair";

import { Position } from "../observer/Referee";

interface SimpleSMA {
  name: "Simple SMA",
  config: SimpleSmaConfig
}

interface SMACrossover {
  name: "SMA Crossover",
  config: SmaCrossOverConfig
}

interface SMALocalMinimum {
  name: "SMA Local Minimum",
  config: SMALocalMinimumConfig
}

export type StrategieConfig = SimpleSMA | SMACrossover | SMALocalMinimum

interface BotConfigParams {
  pair: Pairs
  strategy: StrategieConfig
  candleSize: CandleInterval
  startPosition?: Position
  test?: boolean
}

class BotConfig {
  config: BotConfigParams

  constructor(config: BotConfigParams) {
    this.config = config
  }
}

export default BotConfig
