import { composeAsync } from '../../lib/composeAsync.js'
import { errorHandler } from '../errorHandler.js'
import { extractArgs } from './extractArgs.js'
import { parseCommandArgs } from './parseCommandArgs.js'
import { validatePermissions } from './validatePermissions.js'
import { updateSetting } from './updateSetting.js'


const config = composeAsync(
  extractArgs,
  parseCommandArgs,
  validatePermissions,
  updateSetting
)

export { help } from './messages.js'
export const channelTypes = ['GUILD_TEXT', 'GUILD_PUBLIC_THREAD']
export const execute = (args) => config(args).catch(errorHandler(args.message))
