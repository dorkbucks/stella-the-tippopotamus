import { default as t } from 'tap'

import { extractArgsFromMessage } from '../extractArgsFromMessage.js'


const baseMessage = {
  author: {},
  guild: {},
  channel: {}
}

t.test('Basic tip command', ({ end }) => {
  const message = {
    ...baseMessage,
    content: '.tip active 100 dork'
  }
  const args = extractArgsFromMessage(message)
  t.equal(args.sender, message.author, 'Should save message author as sender prop')
  t.equal(args.server, message.guild, 'Should save guild object as server prop')
  t.equal(args.channel, message.channel, 'Should save channel object as channel prop')
  t.same(args.commandArgs, ['active', '100', 'dork'], 'Should save command args as array')
  t.equal(args.message, message, 'Should include original message object as message prop')
  end()
})

t.test('Message is a reply', ({ end }) => {
  const message = {
    ...baseMessage,
    type: 'REPLY',
    mentions: { repliedUser: {} },
    content: '.tip 100 dork'
  }
  const args = extractArgsFromMessage(message)
  t.equal(args.recipient, message.mentions.repliedUser, 'Should save repliedUser as recipient prop')
  end()
})
