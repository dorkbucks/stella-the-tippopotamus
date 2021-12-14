import BigNumber from 'bignumber.js'
import Datastore from 'nedb-promises'

import { bot } from './bot.js'

const accountsDB = Datastore.create(new URL('../var/accounts.db', import.meta.url).pathname)

export class Account {
  static async getOrCreate (acctData, tokens) {
    let account = await accountsDB.findOne({ _id: acctData.id })
    if (account) {
      return new Account(account, tokens)
    } else {
      const user = await bot.users.fetch(acctData.id)
      const username = user.username
      const avatar = user.avatarURL()
      account = new Account({ ...acctData, username, avatar }, tokens)
      await accountsDB.insert(account)
      return account
    }
  }

  constructor (objOrID, tokens=[]) {
    if (typeof objOrID === 'string') {
      this._id = objOrID
    } else {
      Object.assign(this, objOrID)
      this._id = this._id || this.id
      delete this.id
    }

    this.balances = this.balances || tokens.reduce((bals, token) => {
      bals[token] = 0
      return bals
    }, {})
  }

  credit (token, amount) {
    const balances = { ...this.balances }
    balances[token] = +BigNumber(balances[token]).plus(amount)
    return new Account({ ...this, balances })
  }

  debit (token, amount) {
    const balances = { ...this.balances }
    balances[token] = +BigNumber(balances[token]).minus(amount)
    return new Account({ ...this, balances })
  }

  balanceSufficient (token, amount) {
    return BigNumber(this.balances[token]).gte(amount)
  }

  async save () {
    await accountsDB.update({ _id: this._id }, this)
    return this
  }
}
