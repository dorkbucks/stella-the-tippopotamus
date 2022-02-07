import { BigNumber } from '../../lib/proxied_bignumber.js'


export function calculateAmounts ({ sender, recipients, tokenName, amount, isEach }) {
  const isAll = amount === 'all'
  amount = typeof amount === 'number' ? BigNumber(amount) : amount
  let totalAmount, amountPer
  if (isEach && !isAll) {
    totalAmount = amount.times(recipients.length)
    amountPer = amount
  } else {
    totalAmount = isAll ? BigNumber(sender.balances[tokenName]) : amount
    amountPer = totalAmount.div(recipients.length)
  }
  return [totalAmount, amountPer]
}
