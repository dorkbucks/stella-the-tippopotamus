import { env } from '../../lib/env.js'
import { parseCommand } from '../parse_command.js'


export function extractArgsFromMessage (message) {
  return {
    sender: message.member,
    serverID: message.guildId,
    commandArgs: parseCommand(env.SIGIL, message.content).args,
    message
  }
}
