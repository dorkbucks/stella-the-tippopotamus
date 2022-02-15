import { env } from '../lib/env.js'
import { parseCommand } from './parse_command.js'
import { commands } from './commands_map.js'
import { getCollection } from '../db/index.js'


async function onMessageCreate (message) {
  const { author, content, channel } = message

  if (author.id === env.DISCORD_CLIENT_ID) return

  let serverConfig
  let prefix = '.'

  if (channel.type !== 'DM') {
    const serverConfigs = await getCollection('serverConfigs')
    serverConfig = await serverConfigs.findOne({ serverID: message.guildId })
    prefix = serverConfig.prefix
  }

  if (!content.startsWith(prefix)) return

  const { command, args: commandArgs } = parseCommand(prefix, content)
  const cmd = commands.get(command)

  if (!cmd || !cmd.channelTypes.includes(channel.type)) return

  return cmd && cmd.execute({ commandArgs, serverConfig, message })
}

export async function startCommandHandler (bot) {
  bot.on('messageCreate', onMessageCreate)
}
