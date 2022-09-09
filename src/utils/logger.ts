import chalk, { ChalkFunction } from 'chalk';

type AppModules = 'APP' | 'BINANCE CLIENT' | 'INDICATOR' | 'EVENT' | 'WALLET' | 'ERROR' | 'REFEREE' | 'STRATEGIE' | 'STRATEGIE BUILDER' | 'CRYPTO APP' | 'ORDER SERVICE'

interface Log {
  from: AppModules
  message: string
  bold?: boolean
  type?: 'ERROR' | 'LOG' | 'SUCCESS'
}

const colors = {
  APP: '#fafafa',
  ERROR: '#b71c1c',
  SUCCESS: '#00e676',
  EVENT: '#ffff00',
  'BINANCE CLIENT': '#ff9800',
  'CRYPTO APP': '#ff4081',
  STRATEGIE: '#64b5f6',
  'STRATEGIE BUILDER': '#b85cff',
  WALLET: '#b0fcff',
  REFEREE: '#f5f5f5',
  INDICATOR: '#039be5',
  'ORDER SERVICE': '#a5d6a7',
  TIME: '#76ff03'
}

const chalkObject = {
  'SUCCESS': {
    fromLog: () => chalk.bgHex(colors.SUCCESS),
    messageLog: (color: string) => chalk.hex(color)
  },
  'ERROR': {
    fromLog: () => chalk.bgHex(colors.ERROR),
    messageLog: (color: string) => chalk.hex(color)
  }, 
  'LOG': {
    fromLog: (color: string) => chalk.hex(color),
    messageLog: (color: string) => chalk.hex(color)
  },
  'BOLD': {
    fromLog: (color: string) => chalk.bgHex(color),
    messageLog: (color: string) => chalk.hex(color).bold
  }
}

const logger =  {
  log: ({ from, message, bold, type='LOG' }: Log) => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    let localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -5);
    localISOTime = localISOTime.replaceAll('-', '/').replace('T',' ')
    const timeLog = chalk.hex(colors.TIME)
    const color = colors[from] as string

   const { fromLog, messageLog } = bold ? chalkObject.BOLD : chalkObject[type]
    
   console.log(timeLog(localISOTime) + ' ['+ fromLog(color)(from) + ']'.padEnd(20-from.length) + messageLog(color)(message))
  }
}
export default logger