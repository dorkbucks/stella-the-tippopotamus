import * as REGEX from '../../lib/regexes.js'


export function parseCommandArgs (args) {
  args = { ...args }
  const { commandArgs, recipient } = args

  if (!commandArgs.length) {
    throw new Error('No command arguments')
  }

  for (let i = 0, len = commandArgs.length; i < len; i++) {
    let curr = commandArgs[i]
    let next = commandArgs[i + 1]

    let userMatch = curr.match(REGEX.DISCORD_USER)
    let classifierMatch = curr.match(REGEX.TIP_CLASSIFIER)
    let isAmount = REGEX.AMOUNT.test(curr)

    if (recipient) {
      // Recipient was passed in, amount should be first
      if (i === 0 && !isAmount) {
        throw new Error(`I don't understand what you mean`)
      }

      args.recipients = args.recipients || []
      if (args.recipients.includes(recipient)) {
        continue
      }
      args.recipients.push(recipient)
      delete args.recipient
    } else {
      // No recipient, user ID(s) or classifier should be first
      if (i === 0 && !(userMatch || classifierMatch)) {
        throw new Error(`I don't understand what you mean`)
      }
    }

    if (!recipient && userMatch) {
      const nextIsUserID = REGEX.DISCORD_USER.test(next)
      const nextIsAmount = REGEX.AMOUNT.test(next)
      const nextIsNotUserOrAmount = nextIsUserID ? nextIsAmount : !nextIsAmount
      if (nextIsNotUserOrAmount) {
        throw new Error(`I don't understand what you mean`)
      }
      args.recipients = args.recipients || []
      args.recipients.push(userMatch.groups.id)
    }

    if (!recipient && classifierMatch) {
      if (!REGEX.AMOUNT.test(next)) {
        throw new Error(`I don't understand what you mean`)
      }
      args.classifier = classifierMatch.groups.classifier
    }

    if (isAmount) {
      const nextIsModifier = REGEX.TIP_MODIFIER.test(next)
      const nextIsToken = next && !nextIsModifier && REGEX.TOKEN.test(next)

      if (!nextIsToken) {
        throw new Error(`I don't understand what you mean`)
      }

      args.amount = curr
      args.token = next

      const nextNext = commandArgs[i + 2]
      const nextNextIsModifier = REGEX.TIP_MODIFIER.test(nextNext)
      if (!recipient && nextNextIsModifier) {
        args.modifier = nextNext
      }
    }
  }

  delete args.commandArgs
  return args
}
