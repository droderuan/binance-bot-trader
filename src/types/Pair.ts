export type Pairs = 'BTCUSDT' | 'BNBBTC' | 'BTCBNB' | 'ADABUSD' | 'SHIBBUSD' | 'SHIBBUSD' | 'SHIBUSDT' | 'BTCBUSD' | 'BNBBUSD' | 'ETHBUSD'

export interface PairInfo {
  pair: Pairs,
  status: string,
  buyCoin: string
  buyCoinPrecision: number
  sellCoin: string
  sellCoinPrecision: number
  minQty: number
  maxQty: number
  stepSize: number
  precisionRound: number
}