import QRCode from 'qrcode'
import { MessageAttachment, MessageEmbed } from 'discord.js'

import { walletAddress } from '../../wallet/index.js'
import { tokens } from '../../tokens/index.js'


const tokenList = tokens.list('name', 'logo').reduce((str, { name, logo }) => {
  str = `${str}\n${logo.emoji} **${name}**`
  return str
}, '')

export const channelTypes = ['DM']

export async function execute (message) {
  const memo = message.author.id
  const url = `web+stellar:pay?destination=${walletAddress}&memo=${memo}`
  const qrCodeDataURI = await QRCode.toDataURL(url)
  const qrCodeBuffer = new Buffer.from(qrCodeDataURI.split(',')[1], 'base64')

  const embed = new MessageEmbed()
        .setColor('#ff9900')
        .setAuthor('You may deposit any of these supported tokens:')
        .setDescription(`${tokenList}\n\n**Scan the qr code with your wallet**`)
        .setImage('attachment://qrcode.png')
  const files = [new MessageAttachment(qrCodeBuffer, 'qrcode.png')]

  await message.author.send({ embeds: [embed], files })

  const textMsgs = [
    '**or send to this address:**',
    walletAddress,
    '**with this memo:**',
    memo
  ]

  for (let msg of textMsgs) {
    await message.author.send(msg)
  }
}
