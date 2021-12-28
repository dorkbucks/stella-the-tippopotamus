import { Client, Intents } from 'discord.js'

import { env } from './env.js'


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
bot.token = env.DISCORD_TOKEN
