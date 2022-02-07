import { Account } from '../../lib/account.js'
import { uniquify } from '../../lib/uniquify.js'


export async function transformAndValidateAccounts (args) {
  let { sender, recipients } = args
  recipients = uniquify(recipients)

  for (let r of recipients) {
    if ((r?.id || r) === sender.id) throw new Error(`You can't tip yourself`)
  }

  [sender, ...recipients] = await Promise.all(
    [sender, ...recipients].map((objOrStr) => {
      const obj = typeof objOrStr === 'string' ? { id: objOrStr } : objOrStr
      return (obj instanceof Account) ? obj : Account.getOrCreate(obj)
    })
  )

  args = { ...args, sender, recipients }
  return args
}
