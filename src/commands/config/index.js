import { composeAsync } from '../../lib/composeAsync.js'
import { errorHandler } from '../errorHandler.js'
import { extractArgsFromMessage } from './extractArgsFromMessage.js'
import { parseCommandArgs } from './parseCommandArgs.js'
import { validatePermissions } from './validatePermissions.js'
import { updateSetting } from './updateSetting.js'


const config = composeAsync(
  extractArgsFromMessage,
  parseCommandArgs,
  validatePermissions,
  updateSetting
)

export const channelTypes = ['GUILD_TEXT', 'GUILD_PUBLIC_THREAD']
export const execute = (message) => config(message).catch(errorHandler(message))
