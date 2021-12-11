import Big from 'big.js'
import Datastore from 'nedb-promises'


const accountsDB = Datastore.create(new URL('../var/accounts.db', import.meta.url).pathname)

export class Account {
  static async getOrCreate (id, tokens) {
    let account = await accountsDB.findOne({ _id: id })
    if (!account) {
      account = await accountsDB.insert(new Account(id, tokens))
    }
    return new Account(account, tokens)
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
