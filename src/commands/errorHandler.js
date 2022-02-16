import { MessageEmbed } from 'discord.js'

import { CommandError } from './errors.js'
import { logger } from '../lib/logger.js'


export function errorHandler (message) {
  return function(error) {
    let embed = new MessageEmbed().setColor('#ff2a00')
    if (error instanceof CommandError) {
      embed.setDescription(error.message)
    } else {
      logger.error(error)
      embed.setDescription(`**Uh oh. Something went wrong:**\n\n \`${error.message}\``)
    }
    message.reply({ embeds: [embed] })
  }
}
