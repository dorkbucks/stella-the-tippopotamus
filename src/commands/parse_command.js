export function parseCommand (sigil, cmdString) {
  const [cmd, ...args] = cmdString.slice(sigil.length).trim().split(/,? +/g)
  return {
    command: cmd.toLowerCase(),
    args
  }
}
