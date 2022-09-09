export interface BalanceWsUpdateDTO {
  e: 'outboundAccountPosition',     //Event type
  E: 1635111139141,                 //Event Time
  u: 1635111139140,                 //Time of last account update
  B: {    
    a: string,                      //Asset
    f: string,                      //Free
    l: string                       //Locked
  }[]
}

export type OrderExecutionType = "NEW" | "CANCELED" | "REPLACED" | "REJECTED" | "TRADE" | "EXPIRED"
export type OrderStatus = 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED' | 'PENDING_CANCEL' | 'REJECTED' | 'EXPIRED'
export type OrderType = 'LIMIT' | 'MARKET' | 'STOP_LOSS' | 'STOP_LOSS_LIMIT' | 'TAKE_PROFIT' | 'TAKE_PROFIT_LIMIT' | 'LIMIT_MAKER'
export type OrderSide = "BUY" | "SELL"

export interface OrderWsUpdateDTO {
  e: "executionReport",       // Event type
  E: number,                  // Event time
  s: string,                  // Symbol
  c: string,                  // Client order ID
  S: OrderSide,               // Side
  o: OrderType,               // Order type
  f: string,                  // Time in force
  q: string,                  // Order quantity
  p: string,                  // Order price
  P: string,                  // Stop price
  F: string,                  // Iceberg quantity
  g: number,                  // OrderListId
  C: null | number,           // Original client order ID; This is the ID of the order being canceled
  x: OrderExecutionType,      // Current execution type
  X: OrderStatus,             // Current order status
  r: string,                  // Order reject reason; will be an error code.
  i: number,                  // Order ID
  l: string,                  // Last executed quantity
  z: string,                  // Cumulative filled quantity
  L: string,                  // Last executed price
  n: string,                  // Commission amount
  N: null | number,           // Commission asset
  T: number,                  // Transaction time
  t: number,                  // Trade ID
  I: number,                  // Ignore
  w: true,                    // Is the order on the book?
  m: false,                   // Is this trade the maker side?
  M: false,                   // Ignore
  O: number,                  // Order creation time
  Z: string,                  // Cumulative quote asset transacted quantity
  Y: string,                  // Last quote asset transacted quantity (i.e. lastPrice * lastQty)
  Q: string                   // Quote Order Qty
}

export type updateBalanceWsDTO = BalanceWsUpdateDTO | OrderWsUpdateDTO