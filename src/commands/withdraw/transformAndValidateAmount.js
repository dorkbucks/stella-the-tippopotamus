import { BigNumber } from '../../lib/proxied_bignumber.js'
import { expandSuffixedNum } from '../../lib/expand_suffixed_num.js'


export function transformAndValidateAmount (args) {
  const { sender, token, amount: amt } = args
  const isAll = amt === 'all'
  let amount = isAll ? sender.balances[token.name] : expandSuffixedNum(amt)
  amount = BigNumber(amount)

  if (!sender.balanceSufficient(token.name, amount)) {
    throw new Error(`You can't afford this withdrawal`)
  }

  if (amount.lte(0)) {
    throw new Error(`You can't withdraw **≤ 0**`)
  }

  return { ...args, amount }
}
