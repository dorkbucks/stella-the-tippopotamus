import { parentPort, workerData } from 'worker_threads'
import { Asset, Memo, Keypair } from 'stellar-sdk'

import { Account } from '../lib/account.js'
import { tokens } from '../tokens/index.js'
import { server, txnOpts, sendPayment } from '../stellar/index.js'
import { walletKeypair } from './config.js'
import { getCollection } from '../db/index.js'


const { amount, token, address, memo } = workerData
const [ tokenName, tokenCode, issuer ] = tokens.get(token, 'name', 'code', 'issuer')
const account = new Account(workerData.account)
const asset = new Asset(tokenCode, issuer)

let _memo
try {
  _memo = Memo.id(memo)
} catch {
  try {
    _memo = Memo.text(memo)
  } catch {}
}

const result = await sendPayment(
  { server, txnOpts },
  asset,
  walletKeypair,
  Keypair.fromPublicKey(address),
  amount,
  _memo
)

const debitedAccount = account.debit(tokenName, amount)
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
