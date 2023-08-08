import env from '../src/utils/env'
import BinanceClient from '../src/domains/client/binance/Binance'
import fs from 'fs'
import SMA from '../src/domains/indicators/arithmeticModels/SMA'


export const binanceClient = new BinanceClient({
  apiKey: env.binanceApiKey,
  apiSecret: env.binanceApiSecret,
  useServerTime: true,
})
const window = 24
async function main() {
  const candles = await binanceClient.getHistorical({ pair: 'BTCUSDT', interval: '4h', window: 168 })
  const minimalCandleData = candles.map(({ closePrice, closedAt }) => ({ closePrice, closedAt }))
  const sma = new SMA()

  sma.config({ initialValues: candles, window })
  console.log(candles.length)
  const calculatedCandleSMa = candles.map((candle, index) => ({ ...candle, sma: sma.smaValues[index] }))
  fs.writeFileSync('./candles_btc.json', JSON.stringify(calculatedCandleSMa))

}

main()
