import { Account } from '../lib/account.js'
import { tokens } from '../tokens/index.js'


const TOKENS = tokens.list()

export class Balance {
  constructor (account) {
    this.account = account
  }

  call () {
    const { username, avatar, balances } = this.account
    return {
      message: {
        heading: `${username}'s balances`,
        icon: avatar,
        body: Object.keys(balances).sort((a, b) => a.localeCompare(b)).reduce((str, name) => {
          const { emoji } = tokens.get(name, 'logo')
          const bal = balances[name].toFormat()
          return `${str}\n${emoji} **${name}**: ${bal}`
        }, '')
      }
    }
  }
}
