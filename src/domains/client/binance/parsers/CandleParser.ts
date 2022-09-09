import { CandleInterval, Candlestick } from "../../../../types/Candle"
import CandleResponseDTO from "../../dtos/CandleWebSocketResponseDTO"

export class CandlestickParser {
  static parseHistorical(pair: string, interval: CandleInterval, candlesticks: string[][]): Candlestick[] {
    return candlesticks.map(value => ({
      pair: pair,
      startedAt: parseFloat(value[0]),
      closedAt: parseFloat(value[6]),
      interval: interval,
      openPrice: parseFloat(value[1]),
      highPrice: parseFloat(value[2]),
      lowPrice: parseFloat(value[3]),
      closePrice: parseFloat(value[4]),
      closed: true,
    } as Candlestick))
  }

  static parse(candlestickDTO: CandleResponseDTO): Candlestick {
    return {
      pair: candlestickDTO.s,
      startedAt: candlestickDTO.k.t,
      closedAt: candlestickDTO.k.T,
      interval: candlestickDTO.k.i,
      openPrice: parseFloat(candlestickDTO.k.o),
      closePrice: parseFloat(candlestickDTO.k.c),
      highPrice: parseFloat(candlestickDTO.k.h),
      lowPrice: parseFloat(candlestickDTO.k.l),
      closed: candlestickDTO.k.x,
    } as Candlestick
  }
}