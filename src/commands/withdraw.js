import { Asset, Memo, Keypair } from 'stellar-sdk'
import { MessageEmbed } from 'discord.js'

import { BigNumber } from '../lib/proxied_bignumber.js'
import { tokens } from '../tokens/index.js'
import { expandSuffixedNum } from '../lib/expand_suffixed_num.js'
import { server, validateAccount, txnOpts, sendPayment, expertTxnURL } from '../stellar/index.js'
import { withdraw } from '../wallet/index.js'
import { walletKeypair } from '../wallet/index.js'
import { logger } from '../lib/logger.js'
import * as REGEX from '../lib/regexes.js'


export class WithdrawalRequest {
  static channelTypes = ['DM']

  parseArgs (args) {
    let argsObj = null

    for (let i = 0, len = args.length; i < len; i++) {
      let curr = args[i]
      let next = args[i + 1]
      argsObj = argsObj || {}

      let amt = curr.match(REGEX.AMOUNT)

      if (i === 0 && !amt) return null

      // Memos might match as amt so check if we already have an amount.
      if (amt && !argsObj.amount) {
        const isToken = next && REGEX.TOKEN.test(next)
        if (!isToken) return null
        argsObj.amount = curr === 'all' ? curr : expandSuffixedNum(curr)
        argsObj.token = next
        continue
      }

      const address = curr.match(REGEX.STELLAR_PUBLICKEY)
      if (address) {
        argsObj.address = address[0]

        if (next && REGEX.STELLAR_MEMO.test(next)) {
          argsObj.memo = next
          continue
        }
      }
    }

    return argsObj
  }

  async validate (accountValidator, sender, args) {
    if (!args) {
      throw new Error('.withdraw <amount|all> <token> <address> [memo]' )
    }

    let { amount, token, address, memo } = args
    const [ tokenName, tokenCode, issuer ] = tokens.get(token, 'name', 'code', 'issuer')
    const isAll = amount === 'all'
    amount = isAll ? amount : BigNumber(amount)

    if (!isAll && amount.lte(0)) {
      throw new Error('Amount should be a positive number')
    }

    if (!tokenName || !tokens.isSupported(token)) {
      throw new Error(`${token} is not a supported token`)
    }

    if (!isAll && !sender.balanceSufficient(tokenName, amount)) {
      throw new Error('You cannot afford this withdrawal')
    }

    const asset = new Asset(tokenCode, issuer)

    const { isValid, reason } = await accountValidator(server, asset, address, false)
    if (!isValid) {
      throw new Error(reason)
    }

    if (memo) {
      try {
        Memo.id(memo)
      } catch (e) {
        try {
          Memo.text(memo)
        } catch (e) {
          throw new Error('Memo is invalid')
        }
      }
    }

    return true
  }

  async call (sender, args, { author }) {
    args = this.parseArgs(args)

    try {
      await this.validate(validateAccount, sender, args)
    } catch (e) {
      return { messages: [{ body: e.message }] }
    }

    const [ tokenName ] = tokens.get(args.token, 'name')

    if (args.amount === 'all') {
      args.amount = sender.balances[tokenName]
    }

    withdraw(sender, args)
      .then(({ hash }) => {
        logger.info('Withdraw promise?');
        const txLink = expertTxnURL(hash)
        const embed = new MessageEmbed()
              .setColor('#ff9900')
              .setAuthor(`${tokenName} withdrawal successful`)
              .setDescription(`[View the transaction on Stellar Expert](${txLink})`)
        return author.send({ embeds: [embed] })
      })
      .catch((err) => {
        logger.error(err, 'Encountered an error trying to withdraw')
        const embed = new MessageEmbed()
              .setColor('#ff9900')
              .setAuthor(`Something went wrong.`)
              .setDescription(`Error message: **${e.message}**`)
        return author.send({ embeds: [embed] })
      })

    return { messages: [{
      body: `Your **${tokenName}** withdrawal has been queued. I'll send you another message once it's been processed.`,
    }]}
  }
}
