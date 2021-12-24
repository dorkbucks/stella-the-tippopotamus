import { Account } from '../lib/account.js'
import { tokens } from '../tokens/index.js'


const TOKENS = tokens.list()


export async function getActiveUsers (collection, serverID, lastNMinutes=30, limit=30) {
  const query = {
    [`activity.${serverID}.lastActive`]: {
      $gte: new Date(Date.now() - lastNMinutes * 60000)
    }
  }

  const result = await collection
        .find(query)
        .sort({ lastActive: -1 })
        .limit(limit)
        .toArray()

  return result.map(acct => new Account(acct, TOKENS))
}
