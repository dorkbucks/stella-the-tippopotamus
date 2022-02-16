import { MessageEmbed } from 'discord.js'

import { getCollection } from '../db/index.js'
import * as messages from './messages.js'


export const defaultConfig = {
  prefix: '.',
  maxTipped: 40,
  activeMinutes: 30
}

export async function newServerInitializer (bot) {
  const serverConfigs = await getCollection('serverConfigs')
  const serverWhitelist = await getCollection('serverWhitelist')

  bot.on('guildCreate', async (guild) => {
    const serverID = guild.id
    const config = { ...defaultConfig, serverID }

    let embed = new MessageEmbed().setColor('#ff9900')

    const server = await serverWhitelist.findOne({ serverID })
    if (!server) {
      embed.setDescription(messages.notWhitelisted)
    } else {
      await serverConfigs.updateOne(
        { serverID },
        { $setOnInsert: config },
        { upsert: true }
      )
      embed.setDescription(messages.welcome)
    }

    guild.systemChannel.send({ embeds: [embed] })
  })
}
