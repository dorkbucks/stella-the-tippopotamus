import { BigNumber } from './proxied_bignumber.js'
import { bot } from './bot.js'
import { getCollection } from '../db/index.js'
import { tokens } from '../tokens/index.js'
import * as wallet from '../wallet/index.js'


const TOKENS = tokens.list('name')

export class Account {
  static async getOrCreate (acctData, tokens=TOKENS) {
    const accountsCollection = await getCollection('accounts')
    let account = await accountsCollection.findOne({ _id: acctData.id })
    if (account) {
      return new Account(account, tokens)
    } else {
      const user = await bot.users.fetch(acctData.id)
      const username = user.username
      const avatar = user.avatarURL()
      account = new Account({ id: acctData.id, username, avatar }, tokens)
      await accountsCollection.insertOne(account)
      return account
    }
  }

  constructor (objOrID, tokens=TOKENS) {
    if (typeof objOrID === 'string') {
      this._id = objOrID
    } else if (objOrID instanceof Account) {
      return objOrID
    } else {
      Object.assign(this, objOrID)
      this._id = this._id || this.id
      delete this.id
    }

    if (this.balances) {
      // Reinstantiate BigNumber instances, i.e after retrieving from a db
      this.balances = Object.entries(this.balances).reduce((bals, [token, value]) => {
        bals[token] = BigNumber({ ...value, _isBigNumber: true })
        return bals
      }, {})
    } else {
      this.balances = tokens.reduce((bals, { name }) => {
        bals[name] = BigNumber(0)
        return bals
      }, {})
    }
  }

  credit (token, amount) {
    const balances = { ...this.balances }
    balances[token] = balances[token].plus(amount)
    return new Account({ ...this, balances })
  }

  debit (token, amount) {
    const balances = { ...this.balances }
    balances[token] = balances[token].minus(amount)
    return new Account({ ...this, balances })
  }

  balanceSufficient (token, amount) {
    return BigNumber(this.balances[token]).gte(amount)
  }

  async save () {
    const accountsCollection = await getCollection('accounts')
    await accountsCollection.updateOne({ _id: this._id }, { $set: this })
    return this
  }

  async withdraw({ amount, token, address, memo }) {
    const { hash, created_at } = await wallet.withdraw(amount, token, address, memo)
    const tokenName = token.name
    const debitedAccount = this.debit(tokenName, amount)
    const withdrawal = {
      amount,
      tokenName,
      to: address,
      transactionHash: hash,
      date: created_at
    }

    const accountsCollection = await getCollection('accounts')
    await accountsCollection.updateOne({ _id: debitedAccount._id }, {
      $set: { [`balances.${tokenName}`]: debitedAccount.balances[tokenName] },
      $push: { withdrawals: withdrawal }
    })

    return withdrawal
  }
}
