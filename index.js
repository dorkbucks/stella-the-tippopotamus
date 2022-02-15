import { env } from './src/lib/env.js'
import { bot } from './src/lib/bot.js'
import { logger } from './src/lib/logger.js'
import { newServerInitializer } from './src/config/index.js'
import { startActivityHandler } from './src/activity/index.js'
import { startDepositWatcher } from './src/wallet/deposit_watcher.js'
import { startCommandHandler } from './src/commands/index.js'


const {
  DISCORD_CLIENT_ID,
  DISCORD_TOKEN
} = env

await startDepositWatcher()
newServerInitializer(bot)

bot.once('ready', async () => {
  logger.info(`Tipbot logged in as ${DISCORD_CLIENT_ID}`)
  await startActivityHandler(bot)
  await startCommandHandler(bot)
})
bot.login(DISCORD_TOKEN)
