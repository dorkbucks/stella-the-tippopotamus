export function extractArgs ({ commandArgs, serverConfig, message }) {
  return {
    sender: message.member,
    serverID: message.guildId,
    commandArgs,
    serverConfig,
    message
  }
}
