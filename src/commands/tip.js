import { BigNumber } from '../lib/proxied_bignumber.js'
import { uniquify } from '../lib/uniquify.js'
import { Account } from '../lib/account.js'
import { tokens } from '../tokens/index.js'
import { expandSuffixedNum } from '../lib/expand_suffixed_num.js'


const TOKENS = tokens.list()
const lf = new Intl.ListFormat('en')

export class Tip {
  constructor (sender, args) {
    Object.assign(this, this.parseArgs(args), { sender })
  }

  parseArgs (args) {
    return args.reduce((obj, val) => {
      val = val.toLowerCase()
      const user = val.match(/^<@!?(?<id>\d{17,19})>$/)
      if (user) {
        obj.recipientIDs = [...(obj.recipientIDs || []), user.groups.id]
      } else if (/^\d?.?\d+[k|m|b]?$|all?\b/i.test(val)) {
        obj.amount = val === 'all' ? val : expandSuffixedNum(val)
      } else if (val === 'each') {
        obj.modifier = val
      } else {
        obj.token = val
      }
      return obj
    }, {})
  }

  calcAmounts ({ sender, recipients, token, amount, isAll, isEach }) {
    amount = typeof amount === 'number' ? BigNumber(amount) : amount
    let totalAmount, amountPer
    if (isEach) {
      totalAmount = amount.times(recipients.length)
      amountPer = amount
    } else {
      totalAmount = isAll ? BigNumber(sender.balances[token]) : amount
      amountPer = totalAmount.div(recipients.length)
    }
    return [totalAmount, amountPer]
  }

  async call () {
    const { sender, amount, modifier } = this
    const recipients = uniquify(this.recipientIDs).map(id => ({ id }))
    const token = tokens.get(this.token, 'name')

    if (!token) {
      return { message: { body: `That token isn't supported` } }
    }

    const { emoji } = tokens.get(token, 'logo')
    const minimumTip = BigNumber(tokens.get(token, 'minimumTip'))

    if (this.recipientIDs.includes(sender.id)) {
      return { message: { body: `You can't tip yourself` } }
    }

    const isAll = amount === 'all'
    const isEach = modifier === 'each' && recipients.length > 1
    if (isAll && isEach) {
      return {
        message: {
          body: `You can't tip **all** of your ${emoji} ${token} to **each** person`
        }
      }
    }

    const [senderAccount, ...recipientAccounts] = await Promise.all(
      [sender, ...recipients].map(obj => (
        (obj instanceof Account) ? obj : Account.getOrCreate(obj, TOKENS)
      ))
    )

    const [totalAmount, amountPer] = this.calcAmounts({
      sender, recipients, token, amount, isAll, isEach
    })

    if (totalAmount.lte(0)) {
      return { message: { body: `You can't tip **≤ 0**`} }
    }

    if (!senderAccount.balanceSufficient(token, totalAmount)) {
      return { message: { body: `You can't afford this tip` } }
    }

    if (amountPer.lte(minimumTip)) {
      return { message: { body: `${emoji} The minimum **${token}** tip is **${minimumTip}** per person`} }
    }

    let updatedSenderAccount = senderAccount.debit(token, totalAmount)
    let updatedRecipientAccounts = recipientAccounts.map(account => account.credit(token, amountPer))

    ;[updatedSenderAccount, ...updatedRecipientAccounts] = await Promise.all(
      [updatedSenderAccount, ...updatedRecipientAccounts].map(account => account.save())
    )

    let amountSent = `**${totalAmount} ${token}**`
    if (isEach || amountPer < amount) {
      amountSent = `**${amountPer} ${token} each**`
    }
    const tos = lf.format(recipients.map(({ id }) => `<@${id}>`))

    return {
      message: {
        body: `<@${sender._id}> sent ${emoji} ${amountSent} to ${tos}`
      }
    }
  }
}
