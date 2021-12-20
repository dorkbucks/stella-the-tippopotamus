import dotenv from 'dotenv'
dotenv.config()

import { Keypair } from 'stellar-sdk'


export { startDepositWatcher } from './deposit_watcher.js'
export const walletAddress = process.env.ACCOUNT_PUBLIC_KEY
export const walletKeypair = Keypair.fromSecret(process.env.ACCOUNT_SECRET_KEY)
