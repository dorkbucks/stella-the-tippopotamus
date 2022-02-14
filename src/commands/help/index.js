import { MessageEmbed } from 'discord.js'

import { env } from '../../lib/env.js'
import { parseCommand } from '../parse_command.js'
import { tokens } from '../../tokens/index.js'


const { SIGIL } = env
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

help.tokens = `
**Supported Tokens**
${formatTokens(TOKENS)}
`

help.tip = `
**Tip**
Send tokens to one or more server members.
_This command is only available in text channels._

**\`.tip <recipients> <amount> <token> [each]\`**
_or reply to the recipient with:_
**\`.tip <amount> <token>\`**

_<recipients>_
1 or more @members, "active", or @everyone (the "@" is optional).

_<amount>_
A positive number, "all", or a number suffixed by k, m, or b (i.e. 100k, 10m, 1b).

_<token>_
Any of the supported tokens or their aliases (type \`.bal\` to see supported tokens or \`.help tokens\` for more info).

_[each]_
The optional each modifier will only work if there are multiple recipients. It is ignored otherwise.

_examples:_
_\`\`\`
.tip @rubberdork 1b hippo
.tip @rubberdork @adorkable 1m beaver each
.tip active 10000 dodo
.tip everyone all llama
\`\`\`_
`

help.deposit = `
**Deposit**
_This command is only available in DMs._
Get instructions for depositing tokens to your tipbot account.

**\`.deposit\`**
`

help.withdraw = `
**Withdraw**
Withdraw your tipbot tokens to your Stellar wallet.
_This command is only available in DMs._

**\`.withdraw <amount> <token> <address> [memo]\`**

_<amount>_
A positive number, "all", or a number suffixed by k, m, or b (i.e. 100k, 10m, 1b).

_<token>_
Any of the supported tokens or their aliases (type \`.bal\` to see supported tokens or \`.help tokens\` for more info).

_<address>_
Your Stellar wallet public key (G…). Make sure you have a trustline to the token
you're withdrawing.

_[memo]_
Optional memo id or text. The tipbot will try a memo id first then memo text. If both are invalid, the withdraw command will return an error. Check the [Stellar documentation](https://developers.stellar.org/docs/glossary/transactions/#memo) for what is valid.

_examples:_
_\`\`\`
.withdraw 1000 hippo GCCNM7GCE5WQMRWB4ASK3Y7AYHOBXQZHNSQ4WGZPRMAQNY7GDAGZDORK
\`\`\`_
`

help.active = `
**Active**
_This command is only available in text channels._
Get a list of active users in the current channel.
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

**.bal** _(Text channel and DM)_

**.deposit** _(DM only)_

**.help** _(Text channel and DM)_
\`.help <topic>\`

**.tip** _(Text channel only)_
\`.tip <recipients> <amount> <token> [each]\`
_or reply to the recipient with:_
\`.tip <amount> <token>\`

**.whos** _(Text channel only)_
\`.whos <classifier>\`

**.withdraw** _(DM only)_
\`.withdraw <amount> <token> <address> [memo]\`

Type \`.help help\` for a list of topics.
`

export const channelTypes = ['DM', 'GUILD_TEXT', 'GUILD_PUBLIC_THREAD']

export async function execute (message) {
  let topic = parseCommand(SIGIL, message.content).args[0] || 'index'
  topic = topic.charAt(0) === SIGIL ? topic.slice(SIGIL.length) : topic
  const body = help[topic] || help.huh
  const embed = new MessageEmbed()
        .setColor('#ff9900')
        .setDescription(body)
  await message.reply({ embeds: [embed] })
}
