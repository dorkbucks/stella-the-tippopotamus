import Big from 'big.js'
import Datastore from 'nedb-promises'

import { bot } from './bot.js'

const accountsDB = Datastore.create(new URL('../var/accounts.db', import.meta.url).pathname)

export class Account {
  static async getOrCreate (acctData, tokens) {
    const o = Object.assign({}, acctData)
    o['_id'] = o.id
    delete o.id
    let account = await accountsDB.findOne({ _id: o._id })
    if (account) {
      return new Account(account, tokens)
    } else {
      const user = await bot.users.fetch(o._id)
      o.username = user.username
      o.avatar = user.avatarURL()
      account = new Account(o, tokens)
      await accountsDB.insert(account)
      return account
    }
  }

  constructor (objOrID, tokens=[]) {
    if (typeof objOrID === 'string') {
      this._id = objOrID
    } else {
      Object.assign(this, objOrID)
    }

    this.balances = this.balances || tokens.reduce((bals, token) => {
      bals[token] = 0
      return bals
    }, {})
  }

  credit (token, amount) {
    const balances = { ...this.balances }
    balances[token] = +Big(balances[token]).plus(amount)
    return new Account({ ...this, balances })
  }

  debit (token, amount) {
    const balances = { ...this.balances }
    balances[token] = +Big(balances[token]).minus(amount)
    return new Account({ ...this, balances })
  }

  balanceSufficient (token, amount) {
    return Big(this.balances[token]).gte(amount)
  }

  async save () {
    await accountsDB.update({ _id: this._id }, this)
    return this
  }
}
