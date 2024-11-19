import { Order as BinanceApiOrder, ExecutionReport } from "binance-api-node";

import { Order } from "../../../../types/Order";
import { OrderWsUpdateDTO } from "../../dtos/BalanceWebSocketDTO";
import { PairOrderResponseDTO } from "../../dtos/PairOrderResponseDTO";

export class OrderParser {
  static parse(order: ExecutionReport): Order {
    return {
      pair: order.symbol,
      id: order.orderId,
      clientOrderId: order.newClientOrderId,
      eventTime: order.eventTime,
      price: parseFloat(order.price),
      quantity: parseFloat(order.quantity),
      type: order.orderType,
      status: order.orderStatus,
      lastExecutedQuantity: parseFloat(order.totalTradeQuantity),
      side: order.side,
      creationTime: order.creationTime,
    } as Order;
  }

  static parsePairOrder(order: BinanceApiOrder): Order {
    return {
      pair: order.symbol,
      id: order.orderId,
      clientOrderId: order.clientOrderId,
      eventTime: order.updateTime,
      price: parseFloat(order.price),
      quantity: parseFloat(order.origQty),
      type: order.type,
      status: order.status,
      lastExecutedQuantity: parseFloat(order.executedQty),
      side: order.side,
      creationTime: order.time,
    } as Order;
  }
}
