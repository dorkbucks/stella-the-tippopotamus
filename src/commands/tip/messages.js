export const help = `
**Tip**
Send tokens to one or more server members.
_This command is only available in text channels._

**\`{{prefix}}tip <recipients> <amount> <token> [each]\`**
_or reply to the recipient with:_
**\`{{prefix}}tip <amount> <token>\`**

_<recipients>_
1 or more @members, "active", or @everyone (the "@" is optional).

_<amount>_
A positive number, "all", or a number suffixed by k, m, or b (i.e. 100k, 10m, 1b).

_<token>_
Any of the supported tokens or their aliases (type \`{{prefix}}bal\` to see supported tokens or \`{{prefix}}help tokens\` for more info).

_[each]_
The optional each modifier will only work if there are multiple recipients. It is ignored otherwise.

_examples:_
_\`\`\`
{{prefix}}tip @rubberdork 1b hippo
{{prefix}}tip @rubberdork @adorkable 1m beaver each
{{prefix}}tip active 10000 dodo
{{prefix}}tip everyone all llama
\`\`\`_
`
