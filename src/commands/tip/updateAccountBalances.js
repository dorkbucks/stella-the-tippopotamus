export async function updateAccountBalances (args) {
  const { sender, recipients, amount, token } = args
  const updatedSender = sender.debit(token.name, amount.total)
  const updatedRecipients = recipients.map(account => account.credit(token.name, amount.perRecipient))

  await Promise.all(
    [updatedSender, ...updatedRecipients].map(account => account.save())
  )

  return {
    ...args,
    sender: updatedSender,
    recipients: updatedRecipients
  }
}
