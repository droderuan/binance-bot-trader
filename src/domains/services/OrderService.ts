import { binanceClient } from "../../main";
import { PairInfo } from "../../types/Pair";
import AppError from "../../utils/AppError";
import logger from "../../utils/logger";

interface CreateOrder{
  PairInfo: PairInfo,
  quantity: number
}

class OrderService {

  private fixeNumber(number: number, precisionRound: number): number {
    if(String(number).indexOf('.') !== -1){
      const splitted = String(number).split('.')
      const fixed = splitted[1].slice(0, precisionRound)
      return Number(splitted[0]+'.'+fixed)
    } 
    return number
  }

  async createBuyOrder({ PairInfo, quantity }: CreateOrder){
    const {pair, precisionRound, buyCoin, minQty} = PairInfo

    const currentValue = await binanceClient.currentPrice(pair)
    const quantityWithoufix = quantity / currentValue
    const fixedQuantity = this.fixeNumber(quantityWithoufix, precisionRound)

    logger.log({from: 'ORDER SERVICE', message: `Buying ${quantity} ${buyCoin} of ${pair} at ${currentValue}`})
        
    if (fixedQuantity < minQty) {
      throw new AppError('CREATE BUY ORDER', `Quantity ${quantity} is less than minimum: ${minQty}`)
    }

    try {
      await binanceClient.createBuyOrder(pair, fixedQuantity, currentValue)
      return currentValue
    } catch(err) {
      console.log(err)
    }
  }

  async createSellOrder({ PairInfo, quantity }: CreateOrder){
    const {pair, precisionRound, sellCoin, minQty} = PairInfo
    const currentValue = await binanceClient.currentPrice(pair)
    const fixedQuantity = this.fixeNumber(quantity, precisionRound)

    if (fixedQuantity < minQty) {
      throw new AppError('CREATE SELL ORDER', `Quantity ${quantity} is less than minimum: ${minQty}`)
    }

    logger.log({from: 'ORDER SERVICE', message: `Selling ${quantity} ${sellCoin} of ${pair} at ${currentValue}`})
    try {
      await binanceClient.createSellOrder(pair, fixedQuantity, currentValue)
      return currentValue
    } catch(err) {
      logger.log({from: 'ORDER SERVICE', message: `Error when creating a sell order: ${quantity} ${sellCoin} of ${pair} at ${currentValue}`, type: 'ERROR'})
    }
  }
}

export default OrderService