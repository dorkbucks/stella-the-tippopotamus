import { Tip } from './tip.js'
import { Balance } from './balance.js'
import { DepositRequest } from './deposit.js'


export const commands = new Map()
commands.set('tip', Tip)
commands.set('bal', Balance)
commands.set('deposit', DepositRequest)

export function parseCommand (sigil, cmdString) {
  const [cmd, ...args] = cmdString.slice(sigil.length).trim().split(/,? +/g)
  return {
    command: cmd.toLowerCase(),
    args
  }
}
