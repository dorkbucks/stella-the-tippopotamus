import { MessageEmbed } from 'discord.js'

import { expertTxnURL } from '../../stellar/index.js'


export async function performWithdrawal (args) {
  args.sender.withdraw(args).then(({ transactionHash }) => {
    const txLink = expertTxnURL(transactionHash)
    const embed = new MessageEmbed()
      .setColor('#ff9900')
      .setAuthor(`${args.token.name} withdrawal successful`)
      .setDescription(`[View the transaction on Stellar Expert](${txLink})`)
    return args.message.author.send({ embeds: [embed] })
  })

  const embed = new MessageEmbed()
    .setColor('#ff9900')
    .setDescription(`Your **${args.token.name}** withdrawal has been queued. I'll send you another message once it's been processed`)
  await args.message.author.send({ embeds: [embed] })

  return args
}
