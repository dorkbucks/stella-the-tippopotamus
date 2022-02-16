import { Permissions } from 'discord.js'

import { CommandError } from '../errors.js'


export function validatePermissions (args) {
  const isAdmin = args.sender.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
  if (!isAdmin) {
    throw new CommandError(`You need **Administrator** permissions use this command`)
  }
  return args
}
