export const help = `
**Withdraw**
Withdraw your tipbot tokens to your Stellar wallet.
_This command is only available in DMs._

**\`withdraw <amount> <token> <address> [memo]\`**

_<amount>_
A positive number, "all", or a number suffixed by k, m, or b (i.e. 100k, 10m, 1b).

_<token>_
Any of the supported tokens or their aliases (type \`{{prefix}}bal\` to see supported tokens or \`{{prefix}}help tokens\` for more info).

_<address>_
Your Stellar wallet public key (G…). Make sure you have a trustline to the token you're withdrawing.

_[memo]_
Optional memo id or text. The tipbot will try a memo id first then memo text. If both are invalid, the withdraw command will return an error. Check the [Stellar documentation](https://developers.stellar.org/docs/glossary/transactions/#memo) for what is valid.

_examples:_
_\`\`\`
withdraw 1000 hippo GCCNM7GCE5WQMRWB4ASK3Y7AYHOBXQZHNSQ4WGZPRMAQNY7GDAGZDORK
\`\`\`_
`
