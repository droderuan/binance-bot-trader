import { Pairs } from "../../../types/Pair";
import { OrderSide, OrderStatus, OrderType } from "./BalanceWebSocketDTO";

export interface PairOrderResponseDTO {
  symbol: Pairs
  orderId: number
  orderListId: number | -1
  clientOrderId: string
  price: string
  origQty: string
  executedQty: string
  cummulativeQuoteQty: string
  status: OrderStatus
  timeInForce: 'GTC'
  type: OrderType
  side: OrderSide
  stopPrice: string
  icebergQty: string
  time: number
  updateTime: number
  isWorking: boolean
  origQuoteOrderQty: string
}