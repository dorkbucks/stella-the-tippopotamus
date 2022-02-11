import { MessageEmbed } from 'discord.js'
import { Account } from '../../lib/account.js'
import { tokens } from '../../tokens/index.js'


export const channelTypes = ['DM', 'GUILD_TEXT']

export async function execute (message) {
  const { balances, username, avatar } = await Account.getOrCreate(message.author)
  const balancesString = Object.keys(balances).sort((a, b) => a.localeCompare(b)).reduce((str, name) => {
    const [{ emoji }] = tokens.get(name, 'logo')
    const bal = balances[name].toFormat()
    return `${str}\n${emoji} **${name}**: ${bal}`
  }, '')

  const embed = new MessageEmbed()
        .setColor('#ff9900')
        .setAuthor(`${username}'s balances`, avatar)
        .setDescription(balancesString)

  await message.reply({ embeds: [embed] })
}
