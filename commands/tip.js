import Big from 'big.js'

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
        obj.toIDs = [...(obj.toIDs || []), user.groups.id]
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

  async call () {
    const toIDs = this.toIDs.length > 1 ? uniquify(this.toIDs): this.toIDs
    const { sender, amount, modifier } = this
    const token = tokens.get(this.token, 'name')
    const { emoji } = tokens.get(token, 'logo')

    if (toIDs.includes(sender.id)) {
      return { message: { body: `You can't tip yourself` } }
    }

    const isAll = amount === 'all'
    const isEach = modifier === 'each' && toIDs.length > 1
    if (isAll && isEach) {
      return {
        message: {
          body: `You can't tip **all** of your ${emoji} ${token} to **each** person`
        }
      }
    }

    const [senderAccount, ...to] = await Promise.all(
      [sender, ...toIds].map(o => Account.getOrCreate(o, TOKENS))
    )

    let totalAmount, amountPer
    if (isEach) {
      totalAmount = +Big(amount).times(to.length)
      amountPer = amount
    } else {
      totalAmount = isAll ? from.balances[token] : amount
      amountPer = +Big(totalAmount).div(to.length)
    }

    if (!senderAccount.balanceSufficient(token, totalAmount)) {
      return { message: { body: `You can't afford this tip` } }
    }

    let updatedTo = to.map(t => t.credit(token, amountPer))
    let updatedSenderAccount = senderAccount.debit(token, totalAmount)

    ;[updatedSenderAccount, ...updatedTo] = await Promise.all(
      [updatedSenderAccount, ...updatedTo].map(account => account.save())
    )

    let amountSent = `**${totalAmount} ${token}**`
    if (isEach || amountPer < amount) {
      amountSent = `**${amountPer} ${token} each**`
    }
    const tos = lf.format(toIDs.map(id => `<@${id}>`))

    return {
      from: updatedFrom,
      to: updatedTo,
      message: {
        body: `<@${sender.id}> sent ${emoji} ${amountSent} to ${tos}`
      }
    }
  }
}
