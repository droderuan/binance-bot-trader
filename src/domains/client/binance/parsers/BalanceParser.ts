import { Account, OutboundAccountPosition } from "binance-api-node";
import { Balance } from "../../../services/WalletUserService";

export class BalanceParser {
  static parse(outboundAccountPositionWs: OutboundAccountPosition): Balance {
    return outboundAccountPositionWs.balances.reduce(
      (Pairs, value) =>
        ({
          ...Pairs,
          [value.asset]: {
            available: parseFloat(value.free),
            onOrder: parseFloat(value.locked),
          },
        } as Balance),
      {} as Balance
    );
  }

  static parseCurrentBalance(
    coins: string[],
    currentBalance: Account
  ): Balance {
    const coinsBalances = currentBalance.balances.reduce(
      (balances, currentCoin) => {
        if (coins.includes(currentCoin.asset)) {
          balances[currentCoin.asset] = {
            available: parseFloat(currentCoin.free),
            onOrder: parseFloat(currentCoin.locked),
          };
          return balances;
        }
        return balances;
      },
      {} as { [key: string]: { available: number; onOrder: number } }
    );

    return coinsBalances;
  }
}
