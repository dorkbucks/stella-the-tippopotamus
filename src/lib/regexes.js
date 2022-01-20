export const DISCORD_USER = /^<@!?(?<id>\d{17,19})>$/
export const DISCORD_ROLE = /^<@&?(?<roleid>\d{17,19})>$/
export const TIP_CLASSIFIER = /^@?(?<classifier>active|everyone)$/i
export const AMOUNT = /^\d+.?\d*[k|m|b]?$|all?\b/i
export const TOKEN = /^[a-z]+/i
export const TIP_MODIFIER = /^each?/i
export const STELLAR_PUBLICKEY = /^G[A-Z0-9]{55}$/
export const STELLAR_MEMO = /\S+/
