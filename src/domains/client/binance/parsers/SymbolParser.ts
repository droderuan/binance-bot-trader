import { ExchangeInfo } from "binance-api-node";
import { PairInfo } from "../../../../types/Pair";
import AppError from "../../../../utils/AppError";

export class SymbolParser {
  static parse({ symbols }: ExchangeInfo) {
    return symbols.map((value) => {
      const lotSize = value.filters.find(
        (filter) => filter.filterType === "LOT_SIZE"
      );
      if (!lotSize || lotSize.filterType !== "LOT_SIZE") {
        throw new AppError("SYMBOL_PARSER", "No LOT_SIZE fitler find");
      }

      const coinBuyPrecision: string | undefined = String(
        parseFloat(lotSize.stepSize)
      ).split(".")[1];
      const precision = coinBuyPrecision ? coinBuyPrecision.length : 0;

      return {
        pair: value.symbol,
        buyCoin: value.quoteAsset,
        buyCoinPrecision: value.quoteAssetPrecision,
        sellCoin: value.baseAsset,
        sellCoinPrecision: value.baseAssetPrecision,
        maxQty: parseFloat(lotSize.maxQty),
        minQty: parseFloat(lotSize.minQty),
        stepSize: parseFloat(lotSize.stepSize),
        status: value.status,
        precisionRound: precision,
      } as PairInfo;
    });
  }
}
