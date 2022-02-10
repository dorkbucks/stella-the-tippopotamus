import { MessageEmbed } from 'discord.js'

import { logger } from '../lib/logger.js'


export function errorHandler (message) {
  return function(error) {
    logger.error(error)
    const embed = new MessageEmbed()
      .setColor('#ff2a00')
      .setDescription(error.message)
    message.reply({ embeds: [embed] })
  }
}
