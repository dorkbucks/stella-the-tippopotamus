import { default as t } from 'tap'
import { MessageEmbed } from 'discord.js'

import { sendSuccessMessage } from '../sendSuccessMessage.js'
import { BigNumber } from '../../../lib/proxied_bignumber.js'


function createMockMessage () {
  let reply = {
    args: null
  }
  const mockMessage = {
    reply: (msg) => reply.args = msg
  }
  return [reply, mockMessage]
}

const baseArgs = {
  sender: { _id: 1 },
  token: {
    name: 'Dodo',
    logo: { emoji: ':dodo:' }
  }
}

t.test('Single recipient', async ({ end }) => {
  const [reply, mockMessage] = createMockMessage()
  const args = {
    ...baseArgs,
    recipients: [{ _id: 2 }],
    amount: { total: BigNumber(100), perRecipient: BigNumber(100) },
    message: mockMessage
  }
  const ret = await sendSuccessMessage(args)
  const replyEmbed = reply.args.embeds[0]

  t.same(ret, args, 'Should return original args object')
  t.type(replyEmbed, MessageEmbed, 'Should reply with a Discord MessageEmbed')
  t.equal(
    replyEmbed.description,
    '<@1> sent <@2> :dodo: **100 Dodo**',
    'Should send reply string as embed description'
  )
  end()
})

t.test('Multiple recipients', async ({ end }) => {
  const [reply, mockMessage] = createMockMessage()
  const args = {
    ...baseArgs,
    recipients: [{ _id: 2 }, { _id: 3 }, { _id: 4 }],
    amount: { total: BigNumber(300), perRecipient: BigNumber(100) },
    message: mockMessage,
    modifier: 'each'
  }
  const ret = await sendSuccessMessage(args)
  const replyEmbed = reply.args.embeds[0]

  t.same(ret, args, 'Should return original args object')
  t.type(replyEmbed, MessageEmbed, 'Should reply with a Discord MessageEmbed')
  t.equal(
    replyEmbed.description,
    '<@1> sent <@2>, <@3>, and <@4> :dodo: **100 Dodo each**',
    'Should send reply string as embed description'
  )

  end()
})
