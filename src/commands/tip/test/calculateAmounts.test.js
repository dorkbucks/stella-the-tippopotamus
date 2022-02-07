import { default as t } from 'tap'

import { calculateAmounts } from '../calculateAmounts.js'
import { Account } from '../../../lib/account.js'
import { tokens } from '../../../tokens/index.js'
import { BigNumber } from '../../../lib/proxied_bignumber.js'


function createFundedAccount () {
  const TOKENS = tokens.list()
  return TOKENS.reduce(
    (acct, { name }) => acct.credit(name, 10000),
    new Account({ id: '1234' }, TOKENS)
  )
}

const baseArgs = {
  sender: createFundedAccount(),
  recipients: [createFundedAccount()],
  tokenName: 'Hippopotamus',
  amount: 100,
}

t.test('One recipient', ({ end }) => {
  const [totalAmount, amountPer] = calculateAmounts(baseArgs)
  t.ok(totalAmount.eq(baseArgs.amount), 'Should be BigNumber instance equal to passed in amount')
  t.ok(amountPer.eq(baseArgs.amount), 'Should be BigNumber instance equal to passed in amount')
  end()
})

t.test('Multiple recipients', ({ end }) => {
  const theories = [
    {
      args: { ...baseArgs, amount: 200, recipients: [createFundedAccount(), createFundedAccount()] },
      expected: { totalAmount: 200, amountPer: 100 }
    },
    {
      args: { ...baseArgs, amount: 100, recipients: [createFundedAccount(), createFundedAccount(), createFundedAccount()] },
      expected: { totalAmount: 100, amountPer: 33.3333333 }
    },
  ]

  theories.forEach(({ args, expected }) => {
    const [totalAmount, amountPer] = calculateAmounts(args)
    t.ok(totalAmount.eq(expected.totalAmount))
    t.ok(amountPer.eq(expected.amountPer), 'Should split amount between recipients')
  })

  end()
})

t.test('all', ({ end }) => {
  const args = { ...baseArgs, amount: 'all' }
  const senderBalance = args.sender.balances[args.tokenName]
  const [totalAmount, amountPer] = calculateAmounts(args)
  t.ok(totalAmount.eq(senderBalance))
  t.ok(amountPer.eq(senderBalance))
  end()
})

t.test('each', ({ end }) => {
  const args = { ...baseArgs }
  const theories = [
    {
      args: { ...args, amount: 200, recipients: [createFundedAccount(), createFundedAccount()], isEach: true },
      expected: { totalAmount: 400, amountPer: 200 }
    },
    {
      args: { ...args, amount: 100, recipients: [createFundedAccount(), createFundedAccount(), createFundedAccount()], isEach: true },
      expected: { totalAmount: 300, amountPer: 100 }
    },
  ]
  const senderBalance = args.sender.balances[args.tokenName]

  theories.forEach(({ args, expected }) => {
    const [totalAmount, amountPer] = calculateAmounts(args)
    t.ok(totalAmount.eq(expected.totalAmount), 'Should multiply amount by number of recipients')
    t.ok(amountPer.eq(expected.amountPer), 'Should equal to amount')
  })

  end()
})
