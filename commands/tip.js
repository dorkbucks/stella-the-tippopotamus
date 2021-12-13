import Big from 'big.js'

import { Account } from '../lib/account.js'
import { tokens } from '../tokens/index.js'
import { expandSuffixedNum } from '../lib/expand_suffixed_num.js'


const TOKENS = tokens.list()

export class Tip {
  constructor (fromID, args) {
    Object.assign(this, this.parseArgs(args), { fromID })
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
    const { fromID, toIDs, amount, modifier } = this
    const token = tokens.get(this.token, 'name')

    const [from, ...to] = await Promise.all(
      [fromID, ...toIDs].map(id => Account.getOrCreate(id, TOKENS))
    )

    let totalAmount, amountPer
    if (isEach) {
      totalAmount = +Big(amount).times(to.length)
      amountPer = amount
    } else {
      totalAmount = isAll ? from.balances[token] : amount
      amountPer = +Big(totalAmount).div(to.length)
    }

    if (!from.balanceSufficient(token, totalAmount)) {
      return 'Balance insufficient'
    }

    let updatedFrom = from.debit(token, totalAmount)
    let updatedTo = to.map(t => t.credit(token, amount))

    ;[updatedFrom, ...updatedTo] = await Promise.all(
      [updatedFrom, ...updatedTo].map(account => account.save())
    )

    return {
      from: updatedFrom,
      to: updatedTo
    }
  }
}
