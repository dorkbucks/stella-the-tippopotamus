import { getActiveUsers } from '../activity/index.js'
import { getCollection } from '../db/index.js'


const lf = new Intl.ListFormat('en')
const ucFirst = (str) =>  str.charAt(0).toUpperCase() + str.slice(1)

export class Whos {
  static channelTypes = ['GUILD_TEXT']
  static classifiers = ['active']

  async call (sender, [classifier=''], { server, channel }) {
    classifier = classifier.toLowerCase()

    if (!Whos.classifiers.includes(classifier)) {
      return { messages: [{ body: `Try\n\`.whos ${Whos.classifiers.join('|')}\``}] }
    }

    const accountsCollection = await getCollection('accounts')
    const activeUsers = await getActiveUsers(accountsCollection, server.id, channel.id, 30, 30)
    const activeUsersList = lf.format(activeUsers.map(({ _id }) => `<@${_id}>`))

    const heading = `${ucFirst(classifier)} users in this channel`
    const body = activeUsers.length ? activeUsersList : `No ${classifier} users found`

    return {
      messages: [{
        heading,
        body
      }]
    }
  }
}
