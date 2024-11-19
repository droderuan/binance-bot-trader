import { Candle, CandleChartResult } from "binance-api-node";
import { CandleInterval, Candlestick } from "../../../../types/Candle";
import CandleResponseDTO from "../../dtos/CandleWebSocketResponseDTO";

export class CandlestickParser {
  static parseHistorical(
    pair: string,
    interval: CandleInterval,
    candlesticks: CandleChartResult[]
  ): Candlestick[] {
    return candlesticks.map(
      (value) =>
        ({
          pair: pair,
          startedAt: value.openTime,
          closedAt: value.closeTime,
          interval: interval,
          openPrice: parseFloat(value.open),
          highPrice: parseFloat(value.high),
          lowPrice: parseFloat(value.low),
          closePrice: parseFloat(value.close),
          closed: true,
        } as Candlestick)
    );
  }

  static parse(candlestickDTO: Candle): Candlestick {
    return {
      pair: candlestickDTO.symbol,
      startedAt: candlestickDTO.startTime,
      closedAt: candlestickDTO.closeTime,
      interval: candlestickDTO.interval,
      openPrice: parseFloat(candlestickDTO.open),
      highPrice: parseFloat(candlestickDTO.high),
      lowPrice: parseFloat(candlestickDTO.low),
      closePrice: parseFloat(candlestickDTO.close),
      closed: candlestickDTO.isFinal,
    } as Candlestick;
  }
}
