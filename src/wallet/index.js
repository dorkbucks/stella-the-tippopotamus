import dotenv from 'dotenv'
dotenv.config()


export { startDepositWatcher } from './deposit_watcher.js'
export const walletAddress = process.env.ACCOUNT_PUBLIC_KEY
