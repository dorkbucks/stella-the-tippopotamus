import { Client, Intents, MessageAttachment, MessageEmbed } from 'discord.js'

import { env } from './src/lib/env.js'
import { bot } from './src/lib/bot.js'
import { parseCommand, commands } from './src/commands/index.js'
import { tokens } from './src/tokens/index.js'
import { Account } from './src/lib/account.js'
import { startActivityHandler } from './src/activity/index.js'
import { startDepositWatcher } from './src/wallet/deposit_watcher.js'


const {
  NODE_ENV,
  DISCORD_CLIENT_ID,
  DISCORD_TOKEN,
  DISCORD_GUILD_ID,
  SIGIL,
  CHANNEL_ID
} = env

const TOKENS = tokens.list('name')

await startDepositWatcher()

bot.once('ready', async () => {
  console.log(`Tipbot logged in as ${DISCORD_CLIENT_ID}`)
  await startActivityHandler(bot)
})

bot.on('messageCreate', async (msg) => {
  const { channelId, content, author } = msg
  if (author.id === DISCORD_CLIENT_ID) return

  const channelType = msg.channel.type

  if (!content.startsWith(SIGIL)) return
  const { command, args } = parseCommand(SIGIL, content)
  const Command = commands.get(command)

  if (!Command || !Command.channelTypes.includes(channelType)) return

  const cmd = new Command()

  let sender = Account.getOrCreate({
    id: author.id,
    username: author.username,
    avatar: author.avatarURL()
  }, TOKENS)

  let recipient
  if (msg.type === 'REPLY') {
    const { id, username } = msg.mentions.repliedUser
    recipient = Account.getOrCreate({
      id,
      username,
      avatar: msg.mentions.repliedUser.avatarURL()
    }, TOKENS)
  }

  ;[sender, recipient] = await Promise.all([sender, recipient])

  const server = msg.guild
  const channel = msg.channel

  const result = await cmd.call(
    sender,
    args,
    { recipient, server, channel }
  )

  const send = channelType === 'DM' ? author.send.bind(author) : msg.reply.bind(msg)

  for (let msg of result.messages) {
    if (msg.type === 'text') {
      await send(msg.body)
    } else {
      const {
        heading='',
        icon='',
        body,
        image,
        footer=''
      } = msg

      const files = image ? [new MessageAttachment(image.attachment, image.name)] : []
      const imageName = image ? `attachment://${image.name}` : ''
      const embed = new MessageEmbed()
            .setColor('#ff9900')
            .setAuthor(heading, icon)
            .setDescription(body)
            .setImage(imageName)
            .setFooter(footer)

      await send({ embeds: [embed], files })
    }
  }
})
bot.login(DISCORD_TOKEN)
