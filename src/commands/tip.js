import { BigNumber } from '../lib/proxied_bignumber.js'
import { uniquify } from '../lib/uniquify.js'
import { Account } from '../lib/account.js'
import { tokens } from '../tokens/index.js'
import { expandSuffixedNum } from '../lib/expand_suffixed_num.js'
import { getCollection } from '../db/index.js'
import { getActiveUsers } from '../activity/index.js'
import * as REGEX from '../lib/regexes.js'


const lf = new Intl.ListFormat('en')

export class Tip {
  static channelTypes = ['GUILD_TEXT']

  parseArgs (args, recipient) {
    let argsObj = null
    for (let i = 0, len = args.length; i < len; i++) {
      argsObj = argsObj || {}
      let curr = args[i]
      let next = args[i + 1]

      let userMatch = curr.match(REGEX.DISCORD_USER)
      let classifierMatch = curr.match(REGEX.TIP_CLASSIFIER)
      let isAmount = REGEX.AMOUNT.test(curr)

      if (recipient) {
        // Recipient was passed in, amount should be first
        if (i === 0 && !isAmount) return null
      } else {
        // No recipient, user ID(s) or classifier should be first
        if (i === 0 && !(userMatch || classifierMatch)) {
          return null
        }
      }

      if (!recipient && userMatch) {
        const nextIsUserID = REGEX.DISCORD_USER.test(next)
        const nextIsAmount = REGEX.AMOUNT.test(next)
        const nextIsNotUserOrAmount = nextIsUserID ? nextIsAmount : !nextIsAmount
        if (nextIsNotUserOrAmount) return null
        argsObj.recipientIDs = argsObj.recipientIDs || []
        argsObj.recipientIDs.push(userMatch.groups.id)
      }

      if (!recipient && classifierMatch) {
        if (!REGEX.AMOUNT.test(next)) return null
        argsObj.classifier = classifierMatch.groups.classifier
      }

      if (isAmount) {
        const isToken = next && REGEX.TOKEN.test(next)
        if (!isToken) return null
        argsObj.amount = curr === 'all' ? curr : expandSuffixedNum(curr)
        argsObj.token = next
        continue
      }

      if (!recipient && REGEX.TIP_MODIFIER.test(curr)) {
        argsObj.modifier = curr
      }
    }
    return argsObj
  }

  calcAmounts ({ sender, recipients, tokenName, amount, isAll, isEach }) {
    amount = typeof amount === 'number' ? BigNumber(amount) : amount
    let totalAmount, amountPer
    if (isEach) {
      totalAmount = amount.times(recipients.length)
      amountPer = amount
    } else {
      totalAmount = isAll ? BigNumber(sender.balances[tokenName]) : amount
      amountPer = totalAmount.div(recipients.length)
    }
    return [totalAmount, amountPer]
  }

  async call (sender, args, { recipient, server, channel }) {
    args = this.parseArgs(args, recipient)

    if (args === null) {
      return { messages: [{ body: `I don't understand what you mean` }] }
    }

    const { recipientIDs = [], classifier = '', amount, modifier } = args
    let recipients = recipient ? [recipient] : uniquify(recipientIDs).map(id => ({ id }))

    if (classifier === 'active') {
      const accountsCollection = await getCollection('accounts')
      const activeAccounts = await getActiveUsers(accountsCollection, server.id, channel.id, 30, 30)
      recipients = activeAccounts.filter(({ _id }) => _id !== sender._id)
      if (!recipients.length) {
        return { messages: [{ body: 'Found no other active users in this channel' }] }
      }
    }

    if (classifier === 'everyone') {
      const members = await server.members.list({ limit: 1000 })
      recipients = members.map(m => m.user).filter(u => !u.bot && u.id !== sender._id)
      if (!recipients.length) {
        return { messages: [{ body: 'No users found' }] }
      }
    }

    const [ tokenName, _minimumTip, logo ] = tokens.get(args.token, 'name', 'minimumTip',  'logo')

    if (!tokenName) {
      return { messages: [{ body: `That token isn't supported` }] }
    }

    const { emoji } = logo
    const minimumTip = BigNumber(_minimumTip)

    if (recipientIDs.includes(sender._id) || recipient?._id === sender._id) {
      return { messages: [{ body: `You can't tip yourself` }] }
    }

    if (!amount) {
      return { messages: [{ body: `I don't know what amount you mean` }] }
    }

    const isAll = amount === 'all'
    const isEach = modifier === 'each' && recipients.length > 1
    if (isAll && isEach) {
      return {
        messages: [{
          body: `You can't tip **all** of your ${emoji} ${tokenName} to **each** person`
        }]
      }
    }

    const [senderAccount, ...recipientAccounts] = await Promise.all(
      [sender, ...recipients].map(obj => (
        (obj instanceof Account) ? obj : Account.getOrCreate(obj)
      ))
    )

    const [totalAmount, amountPer] = this.calcAmounts({
      sender, recipients, tokenName, amount, isAll, isEach
    })

    if (totalAmount.lte(0)) {
      return { messages: [{ body: `You can't tip **≤ 0**`}] }
    }

    if (!senderAccount.balanceSufficient(tokenName, totalAmount)) {
      return { messages: [{ body: `You can't afford this tip` }] }
    }

    if (amountPer.lt(minimumTip)) {
      return { messages: [{ body: `${emoji} The minimum **${tokenName}** tip is **${minimumTip}** per person`}] }
    }

    let updatedSenderAccount = senderAccount.debit(tokenName, totalAmount)
    let updatedRecipientAccounts = recipientAccounts.map(account => account.credit(tokenName, amountPer))

    ;[updatedSenderAccount, ...updatedRecipientAccounts] = await Promise.all(
      [updatedSenderAccount, ...updatedRecipientAccounts].map(account => account.save())
    )

    let amountSent = `**${totalAmount.toFormat()} ${tokenName}**`
    if (isEach || amountPer.lt(totalAmount)) {
      amountSent = `**${amountPer.toFormat()} ${tokenName} each**`
    }

    // TODO: Update this to `discord_id` (?) when we switch to snowflake ids
    const tos = lf.format(recipientAccounts.map(({ _id }) => `<@${_id}>`))

    return {
      messages: [{
        body: `<@${sender._id}> sent ${tos} ${emoji} ${amountSent}`
      }]
    }
  }
}
