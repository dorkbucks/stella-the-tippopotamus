import { expandSuffixedNum } from '../lib/expand_suffixed_num.js'


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

  async call (sender, args) {
    args = this.parseArgs(args)
  }
}
