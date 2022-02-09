import { Account } from '../../lib/account.js'


export async function transformSenderAccount (args) {
  const sender = await Account.getOrCreate(args.sender)
  return { ...args, sender }
}
