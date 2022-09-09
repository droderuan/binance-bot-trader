import OrderEventEmitter from '../event/Event'
import BotConfig from './BotConfig'
import CryptoAppService from '../services/cryptoAppService'
import { StrategieBuilder } from '../strategies/StrategieBuilder'
import OrderService from '../services/OrderService'
import logger from '../../utils/logger'

class App {
  botConfig: BotConfig
  orderEvent: OrderEventEmitter
  orderService: OrderService

  constructor(botConfig: BotConfig) {
    this.botConfig = botConfig
    this.orderEvent = new OrderEventEmitter()
    this.orderService = new OrderService()
  }

  async start(cb?: Function) {
    logger.log({ from: 'APP', message: 'Starting...' })

    const { strategy: strategieConfig, pair, candleSize } = this.botConfig.config
    const cryptoApp = new CryptoAppService()

    await cryptoApp.setPairInfo(pair)
    cryptoApp.setConfig(this.botConfig)
    cryptoApp.setOrderEvent(this.orderEvent)
    cryptoApp.setOrderService(this.orderService)

    const strategieBuilder = new StrategieBuilder()
    const strategy = await strategieBuilder.build({
      strategieConfig, 
      pair: pair, 
      candleSize
    })

    cryptoApp.setStrategie(strategy)

    await cryptoApp.init().catch(err => {
      console.log(err)
    })
  }
}

export default App