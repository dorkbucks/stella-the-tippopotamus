import { Permissions } from 'discord.js'


export function validatePermissions (args) {
  const isAdmin = args.sender.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
  if (!isAdmin) {
    throw new Error(`You need **Administrator** permissions use this command`)
  }
  return args
}
