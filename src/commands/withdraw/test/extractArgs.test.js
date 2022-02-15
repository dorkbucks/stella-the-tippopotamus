import { default as t } from 'tap'

import { extractArgs } from '../extractArgs.js'


const args = {
  commandArgs: [],
  message: {
    author: { id: 1 }
  }
}
const extracted = extractArgs(args)
t.equal(extracted.sender, args.message.author, 'Should save message author as sender prop')
t.same(extracted.commandArgs, args.commandArgs, 'Should save command args')
t.equal(extracted.message, args.message, 'Should include original message object as message prop')
