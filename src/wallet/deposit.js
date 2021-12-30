export async function deposit (account, depositsCollection, tokenName, txnData) {
  const {
    amount,
    from,
    transaction_hash,
    paging_token,
    created_at
  } = txnData

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
