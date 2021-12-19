import { Asset, Memo, MemoID, MemoText } from 'stellar-sdk'

import { BigNumber } from '../lib/proxied_bignumber.js'
import { tokens } from '../tokens/index.js'
import { expandSuffixedNum } from '../lib/expand_suffixed_num.js'
import { server, validateAccount } from '../stellar/index.js'


const publicKey = /^G[A-Z0-9]{55}$/
const amount = /^\d?.?\d+[k|m|b]?$|all?\b/i
const token = /^[a-z]+/i
const memo = /\S+/


export class WithdrawalRequest {
  static channelTypes = ['DM']

  parseArgs (args) {
    let argsObj = {}
    for (let i = 0, len = args.length; i < len; i++) {
      let curr = args[i]
      let next = args[i + 1]

      let amt = curr.match(amount)

      if (i === 0 && !amt) return null

      // Memos might match as amt so check if we already have an amount.
      if (amt && !argsObj.amount) {
        const isToken = next && token.test(next)
        if (!isToken) return null
        argsObj.amount = curr === 'all' ? curr : expandSuffixedNum(curr)
        argsObj.token = next
        continue
      }

      const address = curr.match(publicKey)
      if (address) {
        argsObj.address = address[0]

        if (next && memo.test(next)) {
          argsObj.memo = next
          continue
        }
      }
    }
    return argsObj
  }

  async validate (accountValidator, sender, { amount, token, address, memo }) {
    const tokenName = tokens.get(token, 'name')
    amount = BigNumber(amount)

    if (amount.lte(0)) {
      throw new Error('Amount should be a positive number')
    }

    if (!tokenName || !tokens.isSupported(token)) {
      throw new Error(`${token} is not a supported token`)
    }

    if (!sender.balanceSufficient(tokenName, amount)) {
      throw new Error('You cannot afford this withdrawal')
    }

    const issuer = tokens.get(token, 'issuer')
    const asset = new Asset(tokenName, issuer)

    const { isValid, reason } = await accountValidator(server, asset, address, false)
    if (!isValid) {
      throw new Error(reason)
    }

    if (memo) {
      try {
        new Memo(MemoID, memo)
      } catch (e) {
        try {
          new Memo(MemoText, memo)
        } catch (e) {
          throw new Error('Memo is invalid')
        }
      }
    }

    return true
  }

  async call (sender, args) {
    args = this.parseArgs(args)
  }
}
