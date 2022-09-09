import { Order } from "../../../../types/Order"
import { OrderWsUpdateDTO } from "../../dtos/BalanceWebSocketDTO"
import { PairOrderResponseDTO } from "../../dtos/PairOrderResponseDTO"

export class OrderParser {
  static parse(order: OrderWsUpdateDTO): Order {
    return {
      pair: order.s,
      id: order.i,
      clientOrderId: order.c,
      eventTime: order.E,
      price: parseFloat(order.p),
      quantity: parseFloat(order.q),
      currentExecutionType: order.x,
      type: order.o,
      status: order.X,
      lastExecutedQuantity: parseFloat(order.l),
      side: order.S,
      creationTime: order.O
    } as Order
  }

  static parsePairOrder(order: PairOrderResponseDTO): Order {
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
      creationTime: order.time
    } as Order
  }
}