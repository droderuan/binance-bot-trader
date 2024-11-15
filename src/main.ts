import env from "./utils/env";
import App from "./domains/app/App";
import BotConfig from "./domains/app/BotConfig";
import BinanceClient from "./domains/client/binance/Binance";
import { Pairs } from "./types/Pair";
import { CandleInterval, Window } from "./types/Candle";

export const botConfig = new BotConfig({
  pair: env.pair as Pairs,
  candleSize: env.candleInterval as CandleInterval,
  strategy: {
    name: "SMA Crossover",
    config: {
      boxTolerance: Number(env.smaCrossover.boxTolerance),
      faster: {
        window: Number(env.smaCrossover.faster.window) as Window,
        reference: {
          toBuy: "closePrice",
          toSell: "closePrice",
        },
      },
      slower: {
        window: Number(env.smaCrossover.slower.window) as Window,
        reference: {
          toBuy: "closePrice",
          toSell: "closePrice",
        },
      },
    },
  },
});

export const binanceClient = new BinanceClient({
  apiKey: env.binanceApiKey,
  apiSecret: env.binanceApiSecret,
  useServerTime: true,
});

const app = new App(botConfig);

binanceClient.wait(() => app.start().catch(console.log));
