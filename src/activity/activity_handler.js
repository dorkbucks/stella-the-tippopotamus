import { getCollection } from '../db/index.js'
import { Account } from '../lib/account.js'
import { tokens } from '../tokens/index.js'


const TOKENS = tokens.list()

function messageHandler (collection) {
  return async function onMessageCreate (msg) {
    const { content, author, createdAt, id } = msg

    if (author.bot) return

    const update = {
      $set: {
        lastActive: createdAt,
        lastMessageID: id
      }
    }

    const result = await collection.updateOne({ _id: author.id }, update)

    if (result.matchedCount) return

    // NOTE: This smells.
    // We run into a MongoDB insert race condition with multiple handlers
    // calling Account.getOrCreate if account doesn't yet exist in the
    // collection. If the first call throws on "create", try again and it'll
    // probably hit the "get" the second time. The second, nested try…catch is
    // unlikely to hit but is there as an additional safety measure. If that
    // fails, just log and bail.
    let account
    try {
      account = await Account.getOrCreate({ id: author.id }, TOKENS)
    } catch (e) {
      try {
        account = await Account.getOrCreate({ id: author.id }, TOKENS)
      } catch {}
    }

    if (!account) {
      console.warn(`Could not getOrCreate Account to save user's activity.`)
      return
    }

    await collection.updateOne({ _id: account._id }, update)
  }
}

export async function startActivityHandler (bot) {
  const accountsCollection = await getCollection('accounts')
  bot.on('messageCreate', messageHandler(accountsCollection))
}
