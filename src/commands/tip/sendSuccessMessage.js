import { MessageEmbed } from 'discord.js'


const lf = new Intl.ListFormat('en')

export async function sendSuccessMessage (args) {
  const {
    amount: { total, perRecipient },
    token: { name: tokenName, logo }
  } = args
  const amountSent = args.modifier === 'each' || perRecipient.lt(total) ?
        `**${perRecipient.toFormat()} ${tokenName} each**` :
        `**${total.toFormat()} ${tokenName}**`
  const taggedRecipients = lf.format(args.recipients.map(({ _id }) => `<@${_id}>`))
  const embed = new MessageEmbed()
        .setColor('#ff9900')
        .setDescription(`<@${args.sender._id}> sent ${taggedRecipients} ${logo.emoji} ${amountSent}`)

  await args.message.reply({ embeds: [embed] })

  return args
}
