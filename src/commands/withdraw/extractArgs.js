export function extractArgs ({ commandArgs, message }) {
  return {
    sender: message.author,
    commandArgs,
    message
  }
}
