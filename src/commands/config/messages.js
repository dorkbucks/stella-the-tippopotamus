export const help = `
**Config**
Change Stella's settings for this server.
_Only members with **Administrator** permissions can change these settings._

**{{prefix}}config prefix** \`prefix\`
Set Stella's command prefix (currently \`{{prefix}}\`)

**{{prefix}}config maxTipped** \`number\`
Set the maximum number of recipients in a single tip (currently \`{{maxTipped}}\`)

**{{prefix}}config activeMinutes** \`number\`
Set the number of minutes wherein a member has sent a message to be considered **active** (currently \`{{activeMinutes}}\`)
`

export const setValue = `
**{{setting}}** is now set to \`{{value}}\`
`

export const getValue = `
**{{setting}}** is currently set to \`{{value}}\`
`
