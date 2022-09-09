import { Pairs } from "../../../types/Pair";

interface PRICE_FILTER {
  filterType: "PRICE_FILTER",
  minPrice: string,
  maxPrice: string,
  tickSize: string
}

interface PERCENT_PRICE {
  filterType: "PERCENT_PRICE",
  multiplierUp: string,
  multiplierDown: string,
  avgPriceMins: number
}

interface LOT_SIZE {
  filterType: "LOT_SIZE",
  minQty: string,
  maxQty: string,
  stepSize: string
}

interface MIN_NOTIONAL {
  filterType: "MIN_NOTIONAL",
  minNotional: string,
  applyToMarket: boolean,
  avgPriceMins: number
}

interface ICEBERG_PARTS {
  filterType: "ICEBERG_PARTS",
  limit: number
}

interface MARKET_LOT_SIZE {
  filterType: "MARKET_LOT_SIZE",
  minQty: string,
  maxQty: string,
  stepSize: string
}

interface MAX_NUM_ORDERS {
  filterType: "MAX_NUM_ORDERS",
  maxNumOrders: number
}

interface MAX_NUM_ALGO_ORDERS {
  filterType: "MAX_NUM_ALGO_ORDERS",
  maxNumAlgoOrders: number
}

export type Filters = PRICE_FILTER | PERCENT_PRICE | LOT_SIZE | MIN_NOTIONAL | ICEBERG_PARTS | MARKET_LOT_SIZE | MAX_NUM_ORDERS | MAX_NUM_ALGO_ORDERS
export type OrderTypes = "LIMIT" | "LIMIT_MAKER" | "MARKET" | "STOP_LOSS_LIMIT" | "TAKE_PROFIT_LIMIT"
export type Permissions = "SPOT" | "MARGIN"

export interface PairsResponseDTO {
  symbols: {
    symbol: Pairs,
    status: string,
    baseAsset: string,
    baseAssetPrecision: number,
    quoteAsset: string,
    quotePrecision: number,
    quoteAssetPrecision: number,
    baseCommissionPrecision: number,
    quoteCommissionPrecision: number,
    orderTypes: OrderTypes[],
    icebergAllowed: boolean,
    ocoAllowed: boolean,
    quoteOrderQtyMarketAllowed: boolean,
    isSpotTradingAllowed: boolean,
    isMarginTradingAllowed: boolean,
    filters: Filters[],
    permissions: Permissions[]
  }[]
}