import { parentPort, workerData } from 'worker_threads'
import { Asset, Memo, Keypair } from 'stellar-sdk'

import { BigNumber } from '../lib/proxied_bignumber.js'
import { server, txnOpts, sendPayment } from '../stellar/index.js'
import { walletKeypair } from './config.js'


const { token, address } = workerData
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

parentPort.postMessage(result)
