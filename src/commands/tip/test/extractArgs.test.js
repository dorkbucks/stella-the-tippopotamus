import { default as t } from 'tap'

import { extractArgs } from '../extractArgs.js'


const baseArgs = {
  commandArgs: [],
  serverConfig: {}
}
const baseMessage = {
  author: {},
  guild: {},
  channel: {}
}

t.test('Basic tip command', ({ end }) => {
  const args = { ...baseArgs, message: { ...baseMessage } }
  const extracted = extractArgs(args)
  t.equal(extracted.sender, args.message.author, 'Should save message author as sender prop')
  t.equal(extracted.server, args.message.guild, 'Should save guild object as server prop')
  t.equal(extracted.channel, args.message.channel, 'Should save channel object as channel prop')
  t.equal(extracted.commandArgs, args.commandArgs, 'Should save commandArgs')
  t.equal(extracted.message, args.message, 'Should include original message object as message prop')
  end()
})

t.test('Message is a reply', ({ end }) => {
  const message = {
    ...baseMessage,
    type: 'REPLY',
    mentions: { repliedUser: {} }
  }
  const args = { ...baseArgs, message }
  t.equal(extractArgs(args).recipient, message.mentions.repliedUser, 'Should save repliedUser as recipient prop')
  end()
})
