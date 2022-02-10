import { default as t } from 'tap'

import { transformAndValidateAmount } from '../transformAndValidateAmount.js'
import { Account } from '../../../lib/account.js'
import { tokens } from '../../../tokens/index.js'


function createFundedAccount () {
  const TOKENS = tokens.list()
  return TOKENS.reduce(
    (acct, { name }) => acct.credit(name, 10000),
    new Account({ id: '1234' }, TOKENS)
  )
}

const baseArgs = {
  sender: createFundedAccount(),
  token: {
    name: 'Hippopotamus'
  }
}

t.test('Invalid amounts', ({ end }) => {
  t.throws(
    () => transformAndValidateAmount({ ...baseArgs, amount: '0' }),
    new Error(`You can't withdraw **≤ 0**`),
    'Should throw on 0 amounts'
  )
  t.throws(
    () => transformAndValidateAmount({ ...baseArgs, amount: '-1' }),
    new Error(`You can't withdraw **≤ 0**`),
    'Should throw on < 0 amounts'
  )
  t.throws(
    () => transformAndValidateAmount({ ...baseArgs, amount: '10001' }),
    new Error(`You can't afford this withdrawal`),
    'Should throw if amount is > sender balance'
  )
  end()
})

t.test('Valid amounts', ({ end }) => {
  const theories = [
    {
      args: { ...baseArgs, amount: '100' },
      expected: { amount: 100 },
    },
    {
      args: { ...baseArgs, amount: '1k' },
      expected: { amount: 1000 },
    },
    {
      args: { ...baseArgs, amount: 'all' },
      expected: { amount: 10000 },
    }
  ]

  theories.forEach(({ args, expected }) => {
    const { amount } = transformAndValidateAmount(args)
    t.equal(amount.toNumber(), expected.amount, 'Should transform to proper BigNumber amounts')
  })
  end()
})
