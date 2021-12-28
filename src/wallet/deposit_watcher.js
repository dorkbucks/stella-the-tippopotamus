import { Server } from 'stellar-sdk'

import { server } from '../stellar/index.js'
import { Account } from '../lib/account.js'
import { tokens } from '../tokens/index.js'
import { walletAddress } from './config.js'
import { getCollection } from '../db/index.js'
import { deposit } from '../wallet/index.js'


const TOKENS = tokens.list('name')

export async function startDepositWatcher () {
  const depositsCollection = await getCollection('deposits')
  const lastDeposit = await depositsCollection.findOne({}, { sort: { date: -1 } })
  const pagingToken = lastDeposit?.pagingToken || 'now'
  const handlers = {
    onmessage: depositHandler(walletAddress, depositsCollection, Account),
    onerror: (error) => console.log(error)
  }

  console.log(`Starting transaction stream at cursor: ${pagingToken}`)

  return server.payments()
               .forAccount(walletAddress)
               .cursor(pagingToken)
               .stream(handlers)
}

export function depositHandler (address, depositsCollection, Account) {
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

    if (type !== 'payment' || to !== address || asset_type === 'native' || !transaction_successful) {
      console.log(`Not a transaction we're interested in. Bailing`)
      return
    }

    const processedDeposit = await depositsCollection.findOne({ txnHash: transaction_hash })
    if (processedDeposit) return

    console.log('Deposit received')
    console.log(deposit)
    console.log()

    const { memo } = await message.transaction()
    const account = await Account.getOrCreate({ id: memo }, TOKENS)

    try {
      const [creditedAccount, depositData] = await deposit(account, {
        amount,
        asset_code,
        from,
        transaction_hash,
        paging_token,
        created_at
      })
      console.log(`Credited ${amount} ${depositData.tokenName} to ${creditedAccount.username}`)
      console.log(JSON.stringify((({_id, username, balances}) => ({_id, username, balances}))(creditedAccount), null, 2))
      console.log()
    } catch (e) {
      console.log(e)
    }
  }
}
