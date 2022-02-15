import { getCollection } from '../../db/index.js'
import { getActiveUsers } from '../../activity/index.js'


export async function transformAndValidateClassifiers (args) {
  if (!args?.classifier) return args

  args = { ...args }
  const { maxTipped, activeMinutes } = args.serverConfig
  let recipients

  switch (args.classifier) {

    case 'active':
      const accountsCollection = await getCollection('accounts')
      const activeAccounts = await getActiveUsers(
        accountsCollection,
        args.server.id,
        args.channel.id,
        parseInt(activeMinutes),
        parseInt(maxTipped)
      )
      recipients = activeAccounts.filter(({ _id }) => _id !== args.sender.id)
      if (!recipients.length) {
        throw new Error('Found no active users in this channel')
      }
      args.recipients = recipients
      break

    case 'everyone':
      const members = await args.server.members.list({ limit: maxTipped })
      recipients = members.map(m => m.user).filter(u => !u.bot && u.id !== args.sender.id)
      if (!recipients.length) {
        throw new Error('No users found')
      }
      args.recipients = recipients
      break

    default:
      break
  }

  delete args.classifier
  return args
}
