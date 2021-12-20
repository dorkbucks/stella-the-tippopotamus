import dotenv from 'dotenv'
dotenv.config()

import { Networks, Server } from 'stellar-sdk'


const { NODE_ENV } = process.env

const testnet = NODE_ENV === 'development'
const NETWORK = testnet ? 'TESTNET' : 'PUBLIC'
const networkPassphrase = Networks[NETWORK]
const HORIZON_URL = `https://horizon${testnet ? '-testnet' : ''}.stellar.org`

export const server = new Server(HORIZON_URL)
export { sendPayment } from './send_payment.js'
