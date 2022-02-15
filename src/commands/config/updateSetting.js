import { MessageEmbed } from 'discord.js'

import { getCollection } from '../../db/index.js'


export async function updateSetting (args) {
  const { setting, value, serverID } = args
  const serverConfigs = await getCollection('serverConfigs')
  const config = await serverConfigs.findOne({ serverID })

  let embed = new MessageEmbed().setColor('#ff9900')
  let messageText = ''

  if (value) {
    await serverConfigs.updateOne({ serverID }, { $set: { [setting]: value } })
    messageText = `**${setting}** is now set to \`${value}\``
  } else {
    const currentValue = config[setting]
    if (!currentValue) return
    messageText = `**${setting}** is currently set to \`${currentValue}\``
  }

  embed.setDescription(messageText)
  return args.message.reply({ embeds: [embed] })
}
