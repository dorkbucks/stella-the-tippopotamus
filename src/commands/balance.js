import { Account } from '../lib/account.js'
import { tokens } from '../tokens/index.js'


const TOKENS = tokens.list()

export class Balance {
  constructor (account) {
    this.account = account
  }

  async call () {
    const { username, avatar, balances } = await Account.getOrCreate(this.account, TOKENS)
    return {
      message: {
        heading: `${username}'s balances`,
        icon: avatar,
        body: Object.keys(balances).sort((a, b) => a.localeCompare(b)).reduce((str, name) => {
          const { emoji } = tokens.get(name, 'logo')
          const bal = (+balances[name]).toLocaleString()
          return `${str}\n${emoji} **${name}**: ${bal}`
        }, '')
      }
    }
  }
}
