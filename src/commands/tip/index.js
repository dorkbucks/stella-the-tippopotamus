import { composeAsync } from '../../lib/composeAsync.js'
import { extractArgs } from './extractArgs.js'
import { parseCommandArgs } from './parseCommandArgs.js'
import { transformAndValidateToken } from './transformAndValidateToken.js'
import { transformAndValidateClassifiers } from './transformAndValidateClassifiers.js'
import { transformAndValidateAccounts } from './transformAndValidateAccounts.js'
import { transformAndValidateAmount } from './transformAndValidateAmount.js'
import { updateAccountBalances } from './updateAccountBalances.js'
import { sendSuccessMessage } from './sendSuccessMessage.js'
import { errorHandler } from '../errorHandler.js'


const tip = composeAsync(
  extractArgs,
  parseCommandArgs,
  transformAndValidateToken,
  transformAndValidateClassifiers,
  transformAndValidateAccounts,
  transformAndValidateAmount,
  updateAccountBalances,
  sendSuccessMessage
)
export { help } from './messages.js'
export const channelTypes = ['GUILD_TEXT', 'GUILD_PUBLIC_THREAD']
export const execute = (args) => tip(args).catch(errorHandler(args.message))
