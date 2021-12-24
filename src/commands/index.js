import { Tip } from './tip.js'
import { Balance } from './balance.js'
import { DepositRequest } from './deposit.js'
import { WithdrawalRequest } from './withdraw.js'
import { Whos } from './whos.js'


export const commands = new Map()
commands.set('tip', Tip)
commands.set('bal', Balance)
commands.set('deposit', DepositRequest)
commands.set('withdraw', WithdrawalRequest)
commands.set('whos', Whos)

export function parseCommand (sigil, cmdString) {
  const [cmd, ...args] = cmdString.slice(sigil.length).trim().split(/,? +/g)
  return {
    command: cmd.toLowerCase(),
    args
  }
}
