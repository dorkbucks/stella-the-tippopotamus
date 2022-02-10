import { composeAsync } from '../../lib/composeAsync.js'
import { extractArgsFromMessage } from './extractArgsFromMessage.js'
import { parseCommandArgs } from './parseCommandArgs.js'
import { transformAndValidateToken } from './transformAndValidateToken.js'
import { transformAndValidateClassifiers } from './transformAndValidateClassifiers.js'
import { transformAndValidateAccounts } from './transformAndValidateAccounts.js'
import { transformAndValidateAmount } from './transformAndValidateAmount.js'
import { updateAccountBalances } from './updateAccountBalances.js'
import { sendSuccessMessage } from './sendSuccessMessage.js'
import { errorHandler } from '../errorHandler.js'


const tip = composeAsync(
  extractArgsFromMessage,
  parseCommandArgs,
  transformAndValidateToken,
  transformAndValidateClassifiers,
  transformAndValidateAccounts,
  transformAndValidateAmount,
  updateAccountBalances,
  sendSuccessMessage
)
export const channelTypes = ['GUILD_TEXT']
export const execute = (message) => tip(message).catch(errorHandler(message))
