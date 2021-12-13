import { Account } from '../lib/account.js'
import { tokens } from '../tokens/index.js'


const TOKENS = tokens.list()

export class Balance {
  constructor (fromID) {
    this.fromID = fromID
  }

  async call () {
    const { balances } = await Account.getOrCreate(this.fromID, TOKENS)
    return {
      message: {
        body: Object.keys(balances).sort((a, b) => a.localeCompare(b)).reduce((str, name) => {
          const { emoji } = tokens.get(name, 'logo')
          const bal = (+balances[name]).toLocaleString()
          return `${str}\n${emoji} **${name}**: ${bal}`
        }, '')
      }
    }
  }
}
