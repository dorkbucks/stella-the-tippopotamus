import { parentPort, workerData } from 'worker_threads'
import { Asset, Memo, Keypair } from 'stellar-sdk'

import { Account } from '../lib/account.js'
import { BigNumber } from '../lib/proxied_bignumber.js'
import { server, txnOpts, sendPayment } from '../stellar/index.js'
import { walletKeypair } from './config.js'
import { getCollection } from '../db/index.js'


const { token, address } = workerData
const account = new Account(workerData.account)
const memo = workerData.memo && Object.setPrototypeOf(workerData.memo, Memo.prototype)
const amount = Object.setPrototypeOf(workerData.amount, BigNumber.prototype)
const asset = new Asset(token.code, token.issuer)

const result = await sendPayment(
  { server, txnOpts },
  asset,
  walletKeypair,
  Keypair.fromPublicKey(address),
  amount,
  memo
)

const debitedAccount = account.debit(token.name, amount)
const withdrawalsCollection = await getCollection('withdrawals')
const withdrawal = {
  accountID: account._id,
  amount,
  token,
  to: address,
  txnHash: result.hash,
  date: result.created_at
}

await Promise.all([
  debitedAccount.save(),
  withdrawalsCollection.insertOne(withdrawal)
])

parentPort.postMessage(result)
