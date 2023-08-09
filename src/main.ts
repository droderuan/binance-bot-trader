import env from './utils/env'
import App from './domains/app/App'
import BotConfig from './domains/app/BotConfig'
import BinanceClient from './domains/client/binance/Binance'
import { Pairs } from './types/Pair'
import { CandleInterval, Window } from './types/Candle'

export const botConfig = new BotConfig({
  pair: env.pair as Pairs,
  candleSize: env.window as CandleInterval,
  test: true,
  strategy: {
    name: 'SMA Local Minimum',
    config: {
      range: Number(env.range) as 3 | 5 | 7 | 9,
      window: Number(env.window1) as Window,
      reference: {
        toBuy: 'closePrice',
        toSell: 'closePrice'
      }
    }
  },
})

export const binanceClient = new BinanceClient({
  apiKey: env.binanceApiKey,
  apiSecret: env.binanceApiSecret,
  useServerTime: true,
})

const app = new App(botConfig)

binanceClient.wait(() => app.start().catch(console.log))

