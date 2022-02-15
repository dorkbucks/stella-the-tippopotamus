export function extractArgs ({ commandArgs, serverConfig, message }) {
  let args = {
    sender: message.author,
    server: message.guild,
    channel: message.channel,
    commandArgs,
    serverConfig,
    message
  }

  if (message.type === 'REPLY') {
    args.recipient = message.mentions.repliedUser
  }

  return args
}
