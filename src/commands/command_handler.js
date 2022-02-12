import { env } from '../lib/env.js'
import { parseCommand } from './parse_command.js'
import { commands } from './commands_map.js'


const { DISCORD_CLIENT_ID, SIGIL } = env

async function onMessageCreate (message) {
  const { author, content, channel } = message

  if (author.id === DISCORD_CLIENT_ID) return
  if (!content.startsWith(SIGIL)) return

  const command = commands.get(parseCommand(SIGIL, content).command)

  if (!command || !command.channelTypes.includes(channel.type)) return

  return command && command.execute(message)
}

export async function startCommandHandler (bot) {
  bot.on('messageCreate', onMessageCreate)
}
