import { Asset, Operation, TransactionBuilder, Memo } from 'stellar-sdk'

export async function sendPayment (config, asset, from, to, amount, memo) {
  const { server, txnOpts } = config
  const basePaymentOpts = {
    asset,
    amount: amount.toString()
  }
  const destination = to.publicKey()

  try {
    const [source, fee, timebounds] = await Promise.all([
      server.loadAccount(from.publicKey()),
      txnOpts.fee || server.fetchBaseFee(),
      server.fetchTimebounds(100)
    ])

    const transactionOpts = { ...txnOpts, fee, timebounds }
    const payment = Operation.payment({ ...basePaymentOpts, destination })

    let txn = new TransactionBuilder(source, transactionOpts)
    txn.addOperation(payment)
    if (memo) {
      txn.addMemo(memo)
    }
    txn = txn.build()
    txn.sign(from)

    const result = await server.submitTransaction(txn)

    return {
      address: destination,
      success: true,
      txn: result
    }
  } catch (e) {
    throw {
      address: destination,
      success: false,
      reason: e.message,
      errorData: e?.response?.data
    }
  }
}
