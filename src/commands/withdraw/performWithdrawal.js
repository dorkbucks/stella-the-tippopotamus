import { MessageEmbed } from 'discord.js'

import { withdraw } from '../../wallet/index.js'
import { expertTxnURL } from '../../stellar/index.js'


export async function performWithdrawal (args) {
  withdraw(args.sender, args).then(({ hash }) => {
    const txLink = expertTxnURL(hash)
    const embed = new MessageEmbed()
      .setColor('#ff9900')
      .setAuthor(`${args.token.name} withdrawal successful`)
      .setDescription(`[View the transaction on Stellar Expert](${txLink})`)
    return args.message.author.send({ embeds: [embed] })
  })

  const embed = new MessageEmbed()
    .setColor('#ff9900')
    .setDescription(`Your **${args.token.name}** withdrawal has been queued. I'll send you another message once it's been processed`)
  args.message.author.send({ embeds: [embed] })

  return args
}
