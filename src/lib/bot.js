import dotenv from 'dotenv'
dotenv.config()

import { Client, Intents } from 'discord.js'


export const bot = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ]
})
bot.token = process.env.DISCORD_TOKEN
