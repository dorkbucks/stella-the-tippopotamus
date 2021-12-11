import dotenv from 'dotenv'
dotenv.config()

import { Client, Intents } from 'discord.js'

import { parseCommand } from './lib/parse_command.js'
import { commands } from './commands/index.js'


const {
  NODE_ENV,
  DISCORD_CLIENT_ID,
  DISCORD_TOKEN,
  DISCORD_GUILD_ID,
  SIGIL,
  CHANNEL_ID
} = process.env

const bot = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ]
})

bot.once('ready', () => console.log(`Tipbot logged in as ${DISCORD_CLIENT_ID}`))
bot.on('messageCreate', async (msg) => {
  const { channelId, content, author } = msg
  if (author.id === DISCORD_CLIENT_ID) return
  if (channelId !== CHANNEL_ID) return
  if (!content.startsWith(SIGIL)) return
  const { command, args } = parseCommand(SIGIL, content)
  const Command = commands.get(command)
  if (!Command) return
  const cmd = new Command(author.id, args)
  console.log(cmd)
})
bot.login(DISCORD_TOKEN)
