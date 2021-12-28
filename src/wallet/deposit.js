import { tokens } from '../tokens/index.js'
import { getCollection } from '../db/index.js'


export async function deposit (account, data) {
  const {
    amount,
    asset_code,
    from,
    transaction_hash,
    paging_token,
    created_at
  } = data

  const depositsCollection = await getCollection('deposits')
  const tokenName = tokens.get(asset_code, 'name')

  const creditedAccount = account.credit(tokenName, amount)
  const deposit = {
    accountID: account._id,
    amount,
    tokenName,
    from,
    txnHash: transaction_hash,
    pagingToken: paging_token,
    date: created_at
  }

  await Promise.all([
    creditedAccount.save(),
    depositsCollection.insertOne(deposit)
  ])

  return [creditedAccount, deposit]
}
