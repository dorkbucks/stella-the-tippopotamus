import dotenv from 'dotenv'
dotenv.config()

import { Client, Intents } from 'discord.js'


export const bot = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES
  ],
  partials: [
    // Need this to receive DMs
    'CHANNEL'
  ]
})
bot.token = process.env.DISCORD_TOKEN
