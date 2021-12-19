import dotenv from 'dotenv'
dotenv.config()

import { Server } from 'stellar-sdk'
import Datastore from 'nedb-promises'

import { server } from '../lib/stellar.js'
import { Account } from '../lib/account.js'
import { tokens } from '../tokens/index.js'


const depositsDB = Datastore.create(new URL('../../var/deposits.db', import.meta.url).pathname)
const TOKENS = tokens.list('name')

export async function startDepositWatcher () {
  const address = process.env.ACCOUNT_PUBLIC_KEY
  const lastDeposit = await depositsDB.findOne().sort({ date: -1 })
  const pagingToken = lastDeposit?.pagingToken || 'now'
  const handlers = {
    onmessage: depositHandler(address, depositsDB, Account),
    onerror: (error) => console.log(error)
  }

  console.log(`Starting transaction stream at cursor: ${pagingToken}`)

  return server.payments()
               .forAccount(address)
               .cursor(pagingToken)
               .stream(handlers)
}

export function depositHandler (address, depositsDB, Account) {
  return async function (message) {
    const {
      type,
      to,
      from,
      amount,
      asset_type,
      asset_code,
      created_at,
      transaction_successful,
      transaction_hash,
      paging_token
    } = message

    console.log('Payment transaction received')

    if (type !== 'payment' && to !== address && asset_type === 'native' && !transaction_successful) {
      console.log(`Not a transaction we're interested in. Bailing`)
      return
    }

    const { memo } = await message.transaction()
    const account = await Account.getOrCreate({ id: memo }, TOKENS)
    const token = tokens.get(asset_code, 'name')
    const creditedAccount = account.credit(token, amount)
    const deposit = {
      accountID: memo,
      amount,
      token,
      from,
      txnHash: transaction_hash,
      pagingToken: paging_token,
      date: created_at
    }

    await Promise.all([
      creditedAccount.save(),
      depositsDB.insert(deposit)
    ])

    console.log(`Credited ${amount} ${token} to user account ${memo}`)
  }
}
