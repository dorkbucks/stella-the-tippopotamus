import * as tip from './tip/index.js'
import * as balance from './balance/index.js'
import * as deposit from './deposit/index.js'
import * as withdraw from './withdraw/index.js'
import * as whos from './whos/index.js'
import * as help from './help/index.js'


export const commands = new Map()
commands.set('tip', tip)
commands.set('bal', balance)
commands.set('withdraw', withdraw)
commands.set('whos', whos)
commands.set('deposit', deposit)
commands.set('help', help)
