import Big from 'big.js'


export class Account {
  static async getOrCreate (id, tokens) {
    console.log(id)
    return new Account(id, tokens)
  }

  constructor (objOrID, tokens=[]) {
    if (typeof objOrID === 'string') {
      this.id = objOrID
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
}
