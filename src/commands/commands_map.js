import { Tip } from './tip.js'
import { Balance } from './balance.js'
import { DepositRequest } from './deposit.js'
import { WithdrawalRequest } from './withdraw.js'
import { Whos } from './whos.js'
import { Help } from './help.js'


export const commands = new Map()
commands.set('tip', Tip)
commands.set('bal', Balance)
commands.set('deposit', DepositRequest)
commands.set('withdraw', WithdrawalRequest)
commands.set('whos', Whos)
commands.set('help', Help)
