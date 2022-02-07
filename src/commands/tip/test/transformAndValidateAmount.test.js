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
  recipients: [createFundedAccount()],
  token: {
    name: 'Hippopotamus',
    minimumTip: 10,
    logo: { emoji: ':hippopotamus:' }
  },
  amount: '100'
}

const theories = [
  {
    args: { ...baseArgs },
    expected: { total: 100, perRecipient: 100 }
  },
  {
    args: { ...baseArgs, amount: 'all' },
    expected: { total: 10000, perRecipient: 10000 }
  },
  {
    args: { ...baseArgs, recipients: [createFundedAccount(), createFundedAccount()], modifier: 'each' },
    expected: { total: 200, perRecipient: 100 }
  },
  {
    // Single recipient + "each"
    args: { ...baseArgs, modifier: 'each' },
    expected: { total: 100, perRecipient: 100 }
  },
]

theories.forEach(({ args, expected }) => {
  const { amount: origAmount } = args
  const { amount } = transformAndValidateAmount(args)
  t.equal(args.amount, origAmount, 'Should not mutate original args object')
  // TODO Replace forEach loop with t.has{,Strict}
  Object.keys(expected).forEach((key) => {
    t.ok(amount[key], `Should add ${key} key to amount object`)
    t.equal(amount[key].toNumber(), expected[key], 'Should calculate proper amounts')
  })
})

t.test('"all" & "each"', ({ end }) => {
  const args = { ...baseArgs, amount: 'all', modifier: 'each' }
  t.throws(
    () => transformAndValidateAmount(args),
    new Error(`You can't use **all** with **each**`)
  )
  end()
})

t.test('amount is less than or equal to 0', ({ end }) => {
  t.throws(
    () => transformAndValidateAmount({ ...baseArgs, amount: '0' }),
    new Error(`You can't tip **≤ 0**`)
  )
  t.throws(
    () => transformAndValidateAmount({ ...baseArgs, amount: '-100' }),
    new Error(`You can't tip **≤ 0**`)
  )
  end()
})

t.test(`amount is less than token's minimumTip`, ({ end }) => {
  t.throws(
    () => transformAndValidateAmount({ ...baseArgs, amount: '9' }),
    /The minimum .* tip is .*/i,
    'Should throw a custom error'
  )
  end()
})

t.test(`sender cannot afford tip`, ({ end }) => {
  t.throws(
    () => transformAndValidateAmount({ ...baseArgs, amount: '1000000' }),
    new Error(`You can't afford this tip`)
  )
  end()
})
