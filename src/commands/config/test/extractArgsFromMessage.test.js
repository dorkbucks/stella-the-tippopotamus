import { default as t } from 'tap'

import { extractArgsFromMessage } from '../extractArgsFromMessage.js'


const message = {
  member: { id: 1 },
  guildId: 2,
  content: '.config prefix .'
}
const args = extractArgsFromMessage(message)
t.equal(args.sender, message.member, 'Should save message member as sender prop')
t.same(args.commandArgs, ['prefix', '.'], 'Should save command args as array')
t.equal(args.message, message, 'Should include original message object as message prop')
