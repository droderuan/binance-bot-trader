import dotenv from "dotenv";
dotenv.config();

function assertNotUndefined(value: string | undefined) {
  if (value === undefined) {
    throw new Error("Env undefined");
  } else return value;
}

export default {
  binanceApiKey: assertNotUndefined(process.env.BINANCE_API_KEY),
  binanceApiSecret: assertNotUndefined(process.env.BINANCE_API_SECRET),
  pair: assertNotUndefined(process.env.PAIR),
  window: assertNotUndefined(process.env.WINDOW),
  smaCrossover: {
    faster: {
      window: assertNotUndefined(process.env.SMA_FASTER_WINDOW),
    },
    slower: {
      window: assertNotUndefined(process.env.SMA_SLOWER_WINDOW),
    },
  },
};
