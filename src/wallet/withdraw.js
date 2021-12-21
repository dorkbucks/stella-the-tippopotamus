import { Asset, Memo, Keypair } from 'stellar-sdk'

import { tokens } from '../tokens/index.js'
import { server, txnOpts, sendPayment } from '../stellar/index.js'
import { walletKeypair } from './config.js'
import { getCollection } from '../db/index.js'


export async function withdraw (account, { amount, token, address, memo }) {
  const tokenName = tokens.get(token, 'name')
  const issuer = tokens.get(token, 'issuer')
  const asset = new Asset(tokenName, issuer)

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

  const debitedAccount = account.debit(token, amount)
  const withdrawal = {
    accountID: account._id,
    amount,
    token,
    to,
    txnHash: result.hash,
    date: result.created_at
  }

  const withdrawalsCollection = await getCollection('withdrawals')

  await Promise.all([
    debitedAccount.save(),
    withdrawalsCollection.insertOne(withdrawal)
  ])

  return result
}