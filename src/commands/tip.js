import { BigNumber } from '../lib/proxied_bignumber.js'
import { uniquify } from '../lib/uniquify.js'
import { Account } from '../lib/account.js'
import { tokens } from '../tokens/index.js'
import { expandSuffixedNum } from '../lib/expand_suffixed_num.js'


const TOKENS = tokens.list()
const lf = new Intl.ListFormat('en')

const userID = /^<@!?(?<id>\d{17,19})>$/
const amount = /^\d?.?\d+[k|m|b]?$|all?\b/i
const token = /[a-z]+/i
const modifier = /^each?/i

export class Tip {
  static channelTypes = ['GUILD_TEXT']

  parseArgs (args, recipient) {
    let argsObj = {}
    for (let i = 0, len = args.length; i < len; i++) {
      let curr = args[i]
      let next = args[i + 1]

      let user = curr.match(userID)
      let isAmount = amount.test(curr)

      if (recipient) {
        // Recipient was passed in, amount should be first
        if (i === 0 && !isAmount) return null
      } else {
        // No recipient, user ID(s) should be first
        if (i === 0 && !user) return null
      }

      if (!recipient && user) {
        const nextIsUserID = userID.test(next)
        const nextIsAmount = amount.test(next)
        const nextIsNotUserOrAmount = nextIsUserID ? nextIsAmount : !nextIsAmount
        if (nextIsNotUserOrAmount) return null
        argsObj.recipientIDs = argsObj.recipientIDs || []
        argsObj.recipientIDs.push(user.groups.id)
      }

      if (isAmount) {
        const isToken = next && token.test(next)
        if (!isToken) return null
        argsObj.amount = curr === 'all' ? curr : expandSuffixedNum(curr)
        argsObj.token = next
        continue
      }

      if (!recipient && modifier.test(curr)) {
        argsObj.modifier = curr
      }
    }
    return argsObj
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

  async call (sender, args, { recipient }) {
    args = this.parseArgs(args, recipient)

    if (args === null) {
      return { message: { body: `I don't understand what you mean` } }
    }

    const { recipientIDs = [], amount, modifier } = args
    const recipients = recipient ? [recipient] : uniquify(recipientIDs).map(id => ({ id }))
    const token = tokens.get(args.token, 'name')

    if (!token) {
      return { message: { body: `That token isn't supported` } }
    }

    const { emoji } = tokens.get(token, 'logo')
    const minimumTip = BigNumber(tokens.get(token, 'minimumTip'))

    if (recipientIDs.includes(sender.id)) {
      return { message: { body: `You can't tip yourself` } }
    }

    if (!amount) {
      return { message: { body: `I don't know what amount you mean` } }
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

    if (amountPer.lt(minimumTip)) {
      return { message: { body: `${emoji} The minimum **${token}** tip is **${minimumTip}** per person`} }
    }

    let updatedSenderAccount = senderAccount.debit(token, totalAmount)
    let updatedRecipientAccounts = recipientAccounts.map(account => account.credit(token, amountPer))

    ;[updatedSenderAccount, ...updatedRecipientAccounts] = await Promise.all(
      [updatedSenderAccount, ...updatedRecipientAccounts].map(account => account.save())
    )

    let amountSent = `**${totalAmount} ${token}**`
    if (isEach || amountPer.lt(totalAmount)) {
      amountSent = `**${amountPer} ${token} each**`
    }

    const tos = lf.format(recipientAccounts.map(({ _id }) => `<@${_id}>`))
    return {
      message: {
        body: `<@${sender._id}> sent ${tos} ${emoji} ${amountSent}`
      }
    }
  }
}
