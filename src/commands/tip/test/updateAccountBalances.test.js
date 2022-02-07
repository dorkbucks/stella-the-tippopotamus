import { default as t } from 'tap'

import { updateAccountBalances } from '../updateAccountBalances.js'
import { Account } from '../../../lib/account.js'
import { BigNumber } from '../../../lib/proxied_bignumber.js'


function createMockAccount (id) {
  let acct = new Account(id)
  acct = Object.keys(acct.balances).reduce(
    (acct, tokenName) => acct.credit(tokenName, 10000),
    acct
  )
  acct.save = async () => {
    acct.save.called++
    return acct
  }
  acct.save.called = 0
  return acct
}

const baseArgs = {
  token: {
    name: 'Dodo',
  },
  amount: {
    total: BigNumber(100),
    perRecipient: BigNumber(100)
  }
}

t.test('Single recipient', async ({ end }) => {
  const args = {
    ...baseArgs,
    sender: createMockAccount('1'),
    recipients: [createMockAccount('2')]
  }
  const { sender, recipients } = await updateAccountBalances(args)

  t.equal(sender.balances['Dodo'].toNumber(), 9900)
  t.equal(sender.save.called, 1, `Should call Account's save method`)
  t.equal(recipients[0].balances['Dodo'].toNumber(), 10100)
  t.equal(recipients[0].save.called, 1, `Should call Account's save method`)
  end()
})

t.test('Multiple recipients', async ({ end }) => {
  const args = {
    ...baseArgs,
    sender: createMockAccount('1'),
    recipients: [createMockAccount('2'), createMockAccount('3'), createMockAccount('4')]
  }
  const { sender, recipients } = await updateAccountBalances(args)

  t.equal(sender.balances['Dodo'].toNumber(), 9900)
  t.equal(sender.save.called, 1, `Should call Account's save method`)
  recipients.forEach((recipient) => {
    t.equal(recipient.balances['Dodo'].toNumber(), 10100)
    t.equal(recipient.save.called, 1, `Should call Account's save method`)
  })
  end()
})
