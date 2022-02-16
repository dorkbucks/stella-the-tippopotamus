import * as REGEX from '../../lib/regexes.js'
import { CommandError } from '../errors.js'


export function parseCommandArgs (args) {
  args = { ...args }
  const { commandArgs } = args

  if (!commandArgs.length) {
    throw new CommandError('No command arguments')
  }

  for (let i = 0, len = commandArgs.length; i < len; i++) {
    let curr = commandArgs[i]
    let next = commandArgs[i + 1]

    let amt = curr.match(REGEX.AMOUNT)

    if (i === 0 && !amt) {
      throw new CommandError(`I don't understand what you mean`)
    }

    // Memos might match as amt so check if we already have an amount.
    if (amt && !args.amount) {
      const isToken = next && REGEX.TOKEN.test(next) && !REGEX.STELLAR_PUBLICKEY.test(next)
      if (!isToken) {
        throw new CommandError(`I don't understand what you mean`)
      }
      args.amount = curr
      args.token = next
      continue
    }

    const address = curr.match(REGEX.STELLAR_PUBLICKEY)
    if (address) {
      args.address = address[0]

      if (next && REGEX.STELLAR_MEMO.test(next)) {
        args.memo = next
        continue
      }
    }
  }

  delete args.commandArgs
  return args
}
