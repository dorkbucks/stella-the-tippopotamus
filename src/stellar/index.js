import { Networks, Server } from 'stellar-sdk'

import { env } from '../lib/env.js'


const { NODE_ENV, STELLAR_MAX_FEE } = env
const testnet = NODE_ENV === 'development'
const NETWORK = testnet ? 'TESTNET' : 'PUBLIC'
const networkPassphrase = Networks[NETWORK]
const HORIZON_URL = `https://horizon${testnet ? '-testnet' : ''}.stellar.org`
const EXPERT_BASE_URL = `https://stellar.expert/explorer/${testnet ? 'testnet' : 'public'}`

export const expertTxnURL = (hash) => `${EXPERT_BASE_URL}/tx/${hash}`
export const server = new Server(HORIZON_URL)
export const txnOpts = {
  fee: STELLAR_MAX_FEE,
  networkPassphrase
}

export { validateAccount } from './validate_account.js'
export { sendPayment } from './send_payment.js'
