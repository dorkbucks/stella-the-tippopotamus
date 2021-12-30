import { Server } from 'stellar-sdk'

import { server } from '../stellar/index.js'
import { Account } from '../lib/account.js'
import { tokens } from '../tokens/index.js'
import { walletAddress } from './config.js'
import { getCollection } from '../db/index.js'
import { deposit } from '../wallet/index.js'
import { logger as _logger } from '../lib/logger.js'


const logger = _logger.child({ module: 'DepositWatcher' })

export async function startDepositWatcher () {
  const depositsCollection = await getCollection('deposits')
  const lastDeposit = await depositsCollection.findOne({}, { sort: { date: -1 } })
  const pagingToken = lastDeposit?.pagingToken || 'now'
  const handlers = {
    onmessage: depositHandler(walletAddress, depositsCollection, Account),
    onerror: (error) => logger.error(error, 'EventStream encountered an error')
  }

  logger.info(`Starting transaction stream at cursor: ${pagingToken}`)

  return server.payments()
               .forAccount(walletAddress)
               .cursor(pagingToken)
               .stream(handlers)
}

export function depositHandler (address, depositsCollection, Account) {
  return async function (message) {
    const {
      type,
      to,
      from,
      amount,
      asset_type,
      asset_code,
      created_at,
      transaction_successful,
      transaction_hash,
      paging_token
    } = message

    logger.info(
      { type, to, from, amount, asset_type, asset_code, transaction_hash },
      'Received a transaction'
    )

    if (type !== 'payment' || to !== address || asset_type === 'native' || !transaction_successful) {
      logger.info(`Not a transaction we're interested in. Bailing`)
      return
    }

    const processedDeposit = await depositsCollection.findOne({ txnHash: transaction_hash })
    if (processedDeposit) {
      logger.warn(processedDeposit, 'Deposit has already been processed')
      return
    }

    const { memo } = await message.transaction()
    const account = await Account.getOrCreate({ id: memo })
    const [ tokenName ] = tokens.get(asset_code, 'name')

    logger.info('Transaction is a valid deposit. Crediting account')

    try {
      const [creditedAccount, depositData] = await deposit(account, depositsCollection, tokenName, message)
      logger.info(
        (({_id, username, balances}) => ({_id, username, balances}))(creditedAccount),
        `Credited ${amount} ${depositData.tokenName} to ${creditedAccount.username}`
      )
    } catch (e) {
      logger.fatal(e, 'Failed to credit deposit to user')
      throw e
    }
  }
}
