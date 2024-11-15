import dotenv from "dotenv";
dotenv.config();

function assertNotUndefined(env: string) {
  const value = process.env[env];
  if (value === undefined) {
    throw new Error(`${env} env undefined`);
  } else return value;
}

export default {
  binanceApiKey: assertNotUndefined("BINANCE_API_KEY"),
  binanceApiSecret: assertNotUndefined("BINANCE_API_SECRET"),
  pair: assertNotUndefined("PAIR"),
  candleInterval: assertNotUndefined("CANDLE_INTERVAL"),
  smaCrossover: {
    boxTolerance: assertNotUndefined("SMA_BOX_TOLERANCE"),
    faster: {
      window: assertNotUndefined("SMA_FASTER_WINDOW"),
    },
    slower: {
      window: assertNotUndefined("SMA_SLOWER_WINDOW"),
    },
  },
};
