import { MessageEmbed } from 'discord.js'

import { env } from '../../lib/env.js'
import { parseCommand } from '.././parse_command.js'
import { getActiveUsers } from '../../activity/index.js'
import { getCollection } from '../../db/index.js'


const lf = new Intl.ListFormat('en')
const ucFirst = (str) =>  str.charAt(0).toUpperCase() + str.slice(1)

const classifiers = ['active']
export const channelTypes = ['GUILD_TEXT', 'GUILD_PUBLIC_THREAD']

export async function execute (message) {
  const { content, guild: server, channel } = message
  const classifier = parseCommand(env.SIGIL, content.toLowerCase()).args[0]

  let embed = new MessageEmbed().setColor('#ff9900')

  if (!classifiers.includes(classifier)) {
    embed = embed.setDescription( `Try\n\`.whos ${classifiers.join('|')}\``)
    return message.reply({ embeds: [embed] })
  }

  const accountsCollection = await getCollection('accounts')
  const activeUsers = await getActiveUsers(accountsCollection, server.id, channel.id, 30, 30)
  const activeUsersList = lf.format(activeUsers.map(({ _id }) => `<@${_id}>`))

  const heading = `${ucFirst(classifier)} users in this channel`
  const body = activeUsers.length ? activeUsersList : `No ${classifier} users found`
  embed = embed
    .setAuthor(heading)
    .setDescription(body)

  await message.reply({ embeds: [embed] })
}
