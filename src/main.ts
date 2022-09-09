import env from './utils/env'
import App from './domains/app/App'
import BotConfig from './domains/app/BotConfig'
import BinanceClient from './domains/client/binance/Binance'
import { Pairs } from './types/Pair'
import { CandleInterval } from './types/Candle'

export const botConfig = new BotConfig({
  pair: env.pair as Pairs,
  candleSize: env.window as CandleInterval,
  strategy: {
    name: 'SMA Crossover',
    config: {
      faster: {
        window: 10,
        reference: {
          toBuy: 'closePrice',
          toSell: 'closePrice'
        }
      },
      slower: {
        window: 50,
        reference: {
          toBuy: 'closePrice',
          toSell: 'closePrice'
        }
      }
    }
  },
})

// export const botConfig = new BotConfig({
//   pair: 'SHIBUSDT',
//   candleSize: '1m',
//   startPosition: 'BOUGHT',
//   strategy: {
//     name: 'Simple SMA',
//     config: {
//       window: 5,
//       reference: {
//         toBuy: 'lowPrice',
//         toSell: 'highPrice'
//       }
//     }
//   },
// })

export const binanceClient = new BinanceClient({
  apiKey: env.binanceApiKey,
  apiSecret: env.binanceApiSecret,
  useServerTime: true,
})

const app = new App(botConfig)

binanceClient.wait(() => app.start())

