import { Tip } from './tip.js'


export const commands = new Map()
commands.set('tip', Tip)

export function parseCommand (sigil, cmdString) {
  const [cmd, ...args] = cmdString.slice(sigil.length).trim().split(/,? +/g)
  return {
    command: cmd.toLowerCase(),
    args
  }
}
