import dotenv from 'dotenv'
dotenv.config()

import { Client, Intents, MessageAttachment, MessageEmbed } from 'discord.js'

import { bot } from './src/lib/bot.js'
import { parseCommand, commands } from './src/commands/index.js'
import { tokens } from './src/tokens/index.js'
import { Account } from './src/lib/account.js'
import { startActivityHandler } from './src/activity/index.js'


const {
  NODE_ENV,
  DISCORD_CLIENT_ID,
  DISCORD_TOKEN,
  DISCORD_GUILD_ID,
  SIGIL,
  CHANNEL_ID
} = process.env

const TOKENS = tokens.list('name')

bot.once('ready', async () => {
  console.log(`Tipbot logged in as ${DISCORD_CLIENT_ID}`)
  await startActivityHandler(bot)
})

bot.on('messageCreate', async (msg) => {
  const { channelId, content, author } = msg
  if (author.id === DISCORD_CLIENT_ID) return

  const channelType = msg.channel.type

  // NOTE: Temporary while in private dev
  if (channelType === 'GUILD_TEXT' && channelId !== CHANNEL_ID) return
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

  const serverID = msg?.guild?.id

  const result = await cmd.call(
    sender,
    args,
    { recipient, serverID }
  )

  const {
    heading='',
    icon='',
    body,
    image,
    footer=''
  } = result.message

  let files = []
  let imageName = ''
  if (image) {
    files.push(new MessageAttachment(image.attachment, image.name))
    imageName = `attachment://${image.name}`
  }

  const embed = new MessageEmbed()
        .setColor('#ff9900')
        .setAuthor(heading, icon)
        .setDescription(body)
        .setImage(imageName)
        .setFooter(footer)

  const channel = channelType === 'DM' ? author : msg.channel
  channel.send({ embeds: [embed], files })
})
bot.login(DISCORD_TOKEN)
