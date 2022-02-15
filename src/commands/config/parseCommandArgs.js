export function parseCommandArgs (args) {
  args = { ...args }
  const [ setting, value ] = args.commandArgs
  if (setting) args.setting = setting
  if (value) args.value = value
  delete args.commandArgs
  return args
}
