import { env } from '../../lib/env.js'
import { parseCommand } from '../parse_command.js'


export function extractArgsFromMessage (message) {
  return {
    sender: message.author,
    commandArgs: parseCommand(env.SIGIL, message.content).args,
    message
  }
}
