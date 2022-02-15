import { MessageEmbed } from 'discord.js'

import { buildText } from '../../lib/buildText.js'
import { tokens } from '../../tokens/index.js'
import { defaultConfig } from '../../config/index.js'
import { help as tipHelp } from '../tip/index.js'
import { help as depositHelp } from '../deposit/index.js'
import { help as withdrawHelp } from '../withdraw/index.js'
import { help as configHelp } from '../config/index.js'


const TOKENS = tokens.list('name', 'logo', 'aliases')

function formatTokens (tokenList) {
  return tokenList
    .sort((a, b) => a.name.localeCompare(b.name))
    .reduce((str, { name, logo, aliases }) => {
      return `${str}\n ${logo.emoji} **${name}**\n_Aliases: \`${aliases.join(', ')}\`_\n`
    }, '')
}

let help = {}

help.huh = 'huh?'
help.tip = tipHelp
help.deposit = depositHelp
help.config = configHelp

help.tokens = `
**Supported Tokens**
${formatTokens(TOKENS)}
`

help.withdraw = withdrawHelp

help.active = `
**Active**
Get a list of active users in the current channel.
_The \`{{prefix}}whos active\` command is only available in text channels._
`

help.help = `
**Help**
View information about a command or topic.
_This command is available in text channels and DMs._

**\`.help <topic>\`**

_<topic>_
active
deposit
help
tip
tokens
withdraw
`

help.index = `
**Command Overview**

**{{prefix}}bal** _(Text channel and DM)_

**.deposit** _(DM only)_

**{{prefix}}help** _(Text channel and DM)_
\`{{prefix}}help <topic>\`

**{{prefix}}tip** _(Text channel only)_
\`{{prefix}}tip <recipients> <amount> <token> [each]\`
_or reply to the recipient with:_
\`{{prefix}}tip <amount> <token>\`

**{{prefix}}whos** _(Text channel only)_
\`{{prefix}}whos <classifier>\`

**.withdraw** _(DM only)_
\`.withdraw <amount> <token> <address> [memo]\`

Type \`{{prefix}}help help\` for a list of topics.
`

export const channelTypes = ['DM', 'GUILD_TEXT', 'GUILD_PUBLIC_THREAD']

export async function execute ({ commandArgs, serverConfig, message }) {
  let topic = commandArgs[0] || 'index'
  const { prefix } = serverConfig || defaultConfig
  topic = topic.charAt(0) === prefix ? topic.slice(prefix.length) : topic
  const body = buildText(help[topic] || help.huh, serverConfig)
  const embed = new MessageEmbed()
        .setColor('#ff9900')
        .setDescription(body)
  await message.reply({ embeds: [embed] })
}
