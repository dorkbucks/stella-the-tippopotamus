import { composeAsync } from '../../lib/composeAsync.js'
import { extractArgsFromMessage } from './extractArgsFromMessage.js'
import { parseCommandArgs } from './parseCommandArgs.js'
import { validateAddress } from './validateAddress.js'
import { transformAndValidateMemo } from './transformAndValidateMemo.js'
import { transformAndValidateToken } from './transformAndValidateToken.js'
import { transformSenderAccount } from './transformSenderAccount.js'
import { transformAndValidateAmount } from './transformAndValidateAmount.js'
import { performWithdrawal } from './performWithdrawal.js'
import { errorHandler } from '../errorHandler.js'


const withdraw = composeAsync(
  extractArgsFromMessage,
  parseCommandArgs,
  transformAndValidateToken,
  validateAddress,
  transformAndValidateMemo,
  transformSenderAccount,
  transformAndValidateAmount,
  performWithdrawal
)
export const channelTypes = ['DM']
export const execute = (message) => withdraw(message).catch(errorHandler(message))
