import { MessageAttachment, MessageEmbed } from 'discord.js'

import { env } from '../lib/env.js'
import { parseCommand } from './parse_command.js'
import { commands } from './commands_map.js'
import { Account } from '../lib/account.js'
import { tokens } from '../tokens/index.js'


const { DISCORD_CLIENT_ID, SIGIL } = env
const TOKENS = tokens.list('name')

function messageCreateHandler () {
  return async function onMessageCreate (msg) {
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
  }
}

export async function startCommandHandler (bot) {
  bot.on('messageCreate', messageCreateHandler())
}
