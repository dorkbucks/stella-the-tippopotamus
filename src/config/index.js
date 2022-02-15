import { getCollection } from '../db/index.js'


export const defaultConfig = {
  prefix: '.',
  maxTipped: 40,
  activeMinutes: 30
}

export async function newServerInitializer (bot) {
  const serverConfigs = await getCollection('serverConfigs')

  bot.on('guildCreate', (guild) => {
    const serverID = guild.id
    const config = { ...defaultConfig, serverID }

    serverConfigs.updateOne(
      { serverID },
      { $setOnInsert: config },
      { upsert: true }
    )
  })
}
