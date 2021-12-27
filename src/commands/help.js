export class Help {
  static channelTypes = ['GUILD_TEXT', 'DM']

  parseArgs ([topic='index']) {
    return {
      topic: topic.charAt(0) === SIGIL ? topic.slice(SIGIL.length) : topic
    }
  }

  async call (sender, args) {
    const { topic } = this.parseArgs(args)
    const heading = ''
    const body = ''
    return {
      message: {
        heading,
        body
      }
    }
  }
}
