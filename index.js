import dotenv from 'dotenv'
dotenv.config()

import { Client, Intents } from 'discord.js'


const {
  NODE_ENV,
  DISCORD_CLIENT_ID,
  DISCORD_TOKEN,
  DISCORD_GUILD_ID,
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
  console.log(msg)
})
bot.login(DISCORD_TOKEN)
