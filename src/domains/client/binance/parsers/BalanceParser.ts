import { Balance } from "../../../services/WalletUserService"
import { BalanceResponseDTO } from "../../dtos/BalanceResponseDTO"
import { BalanceWsUpdateDTO } from "../../dtos/BalanceWebSocketDTO"

export class BalanceParser {
  static parse(lastBalance: BalanceWsUpdateDTO ): Balance {
    return lastBalance.B.reduce((Pairs, value) => ({
      ...Pairs,
      [value.a]: {
        available: parseFloat(value.f),
        onOrder: parseFloat(value.l),
      }
    } as Balance), {} as Balance)
  }

  static parseCurrentBalance(coins: string[], currentBalance: BalanceResponseDTO): Balance {
    const coinsBalances = coins.map(coin => ({coinName: coin, info: currentBalance[coin]}))
          
    const parsedBalance = coinsBalances.reduce((balance: Balance, coin) =>{
      return {...balance, [coin.coinName]: {
        available: parseFloat(coin.info.available),
        onOrder: parseFloat(coin.info.onOrder)
      }} as Balance
    }, {})

    return parsedBalance
  }
}