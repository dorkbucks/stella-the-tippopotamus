import { Keypair } from 'stellar-sdk'

import { env } from '../lib/env.js'


export const walletAddress = env.ACCOUNT_PUBLIC_KEY
export const walletKeypair = Keypair.fromSecret(env.ACCOUNT_SECRET_KEY)
