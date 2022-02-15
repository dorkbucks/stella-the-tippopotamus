import { default as t } from 'tap'

import { extractArgs } from '../extractArgs.js'


const args = {
  commandArgs: ['prefix', '.'],
  serverConfig: {},
  message: {
    member: { id: 1 },
    guildId: 2
  }
}
const extracted = extractArgs(args)
t.equal(extracted.sender, args.message.member, 'Should save message member as sender prop')
t.equal(extracted.serverID, args.message.guildId, 'Should save guildId as serverID prop')
t.same(extracted.serverConfig, args.serverConfig, 'Should save serverConfig')
t.equal(extracted.message, args.message, 'Should include original message object as message prop')
