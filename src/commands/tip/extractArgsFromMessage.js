import { env } from '../../lib/env.js'
import { parseCommand } from '../parse_command.js'


export function extractArgsFromMessage (message) {
  let args = {
    sender: message.author,
    server: message.guild,
    channel: message.channel,
    commandArgs: parseCommand(env.SIGIL, message.content).args,
    message
  }

  if (message.type === 'REPLY') {
    args.recipient = message.mentions.repliedUser
  }

  return args
}
