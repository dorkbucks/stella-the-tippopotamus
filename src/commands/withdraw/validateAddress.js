import { Asset } from 'stellar-sdk'

import { server, validateAccount } from '../../stellar/index.js'


export async function validateAddress (args) {
  if (!args?.address) {
    throw new Error('No Stellar address provided')
  }

  const { token, address } = args
  const asset = new Asset(token.code, token.issuer)

  const { isValid, reason } = await validateAccount(server, asset, address, false)
  if (!isValid) {
    throw new Error(reason)
  }

  return args
}
