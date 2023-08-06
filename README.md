# Binance Crypto Trader
![ezgif com-gif-maker (2)](https://user-images.githubusercontent.com/43659888/189414480-bfc5e8c8-2ada-42c8-be4d-d45bdf2be713.gif)

**Welcome to the crypto trader bot for the binance.**
My intention was to be my personal bot to make trades based on strategies that I find on the internet. Now I think it could be used for others.
As it runs on binance, is important to state that each transaction (not for all pairs) Binance gets 0,1% as tax.
To reduce by 25% the tax, you can use BNB in your wallet to pay the taxes.

> Without BNB: 0.1%
> With BNB: 0.075%

## About the bot

The bot was made with Typescript and I design it to be very modular.
My main goal was to provide a bot that could receive new strategies and indicators to be used in the intelligence of the decisions.

### Strategies

Every strategy is designed to receive an update and make a decision over it, so the bot can be very precisely and consistently. To implement a new strategy would be only needed to follow the interface and let the bot do the rest.
The bot can have two states:

- Bought: if you have the target coin
- Empty: If you have not bought the coin
  > You can set manually the state or let the bot decide which state to start. It checks of the last order of the pair.

When a strategy emits a BUY/SELL order, the bot will create an order and check if it is filled by 5 times with 5s interval, 25 seconds. If it is not filled, the bot cancels the order and waits for the next BUY/SELL event. If the strategy still says to BUY/SELL, this process starts again until the bot changes his state to the opposite.

Right now the bot can be configured with 2 strategies: **Simple SMA and SMA Crossover**.

### Updates of the candle values

It connects to Binance using WebSockets, so the bot gets real-time updates about the candles and performs decisions over these updates.

## TODO

- Refactor the setup of the bot to be more friendly.
- Create strategies to simulate orders and stop-loss orders.
- Improve the way the bot handles the monitoring of an open order.

## Contact
Would like to talk? Feel free to contact me.
* E-mail: ruan.fer.gui@gmail
* Linkedin: [Ruan Ferreira](https://www.linkedin.com/in/ruan-ferreira-87a15a180/)

Would like to make a donation?
My wallet: 0xDBdE9621d01D72c69aB60FaC73EDf93F735C54f6
