import { expandSuffixedNum } from '../../lib/expand_suffixed_num.js'
import { calculateAmounts } from './calculateAmounts.js'
import { CommandError } from '../errors.js'


export function transformAndValidateAmount (args) {
  const { sender, recipients, amount: amt, modifier } = args
  const amount = amt === 'all' ? amt : expandSuffixedNum(amt)
  const { minimumTip, logo: { emoji }, name: tokenName } = args.token
  const isAll = amount === 'all'
  const isEach = modifier === 'each' && recipients.length > 1

  const [total, perRecipient] = calculateAmounts({
    sender, recipients, tokenName, amount, isEach
  })

  if (isAll && modifier === 'each') {
    throw new CommandError(`You can't use **all** with **each**`)
  }

  if (total.lte(0)) {
    throw new CommandError(`You can't tip **≤ 0**`)
  }

  if (total.lt(minimumTip)) {
    throw new CommandError(`The minimum ${emoji} **${tokenName}** tip is **${minimumTip}** per person`)
  }

  if (!sender.balanceSufficient(tokenName, total)) {
    throw new CommandError(`You can't afford this tip`)
  }

  return {
    ...args,
    amount: { total, perRecipient }
  }
}
