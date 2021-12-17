import { Account } from '../lib/account.js'
import { tokens } from '../tokens/index.js'


export class Balance {
  static aliases = ['bal', 'bals', 'balance', 'balances']
  static channelTypes = ['DM', 'GUILD_TEXT']

  call ({ username, avatar, balances }) {
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
