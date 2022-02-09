import { default as t } from 'tap'

import { extractArgsFromMessage } from '../extractArgsFromMessage.js'


t.test('', ({ end }) => {
  const message = {
    author: { id: 1 },
    content: '.withdraw 100 hippo'
  }
  const args = extractArgsFromMessage(message)
  t.equal(args.sender, message.author, 'Should save message author as sender prop')
  t.same(args.commandArgs, ['100', 'hippo'], 'Should save command args as array')
  t.equal(args.message, message, 'Should include original message object as message prop')
  end()
})
