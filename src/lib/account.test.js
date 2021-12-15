import { test } from 'tap'

import { BigNumber } from './proxied_bignumber.js'
import { Account } from './account.js'


const TOKENS = [
  'BTC',
  'ETH',
  'XLM'
]

const balances = {
  BTC: 0,
  ETH: 0,
  XLM: 0
}

test('Constructor works with id string', (t) => {
  const id = '1234'
  const acct = new Account(id, TOKENS)
  t.equal(id, acct._id)
  t.end()
})

test('Constructor works with object', (t) => {
  const obj = {
    id: '5678',
    username: 'rubberdork',
    avatar: 'dork.png'
  }
  const acct = new Account(obj, TOKENS)
  t.equal(obj.id, acct._id, `Saves .id as ._id`)
  t.notOk(acct.id, `Saves .id as ._id`)
  t.equal(obj.username, acct.username)
  t.equal(obj.avatar, acct.avatar)

  const obj2 = { _id: '1234' }
  const acct2 = new Account(obj2, TOKENS)
  t.equal(obj2._id, acct2._id, `Saves ._id as ._id`)
  t.notOk(acct2.id, `Saves ._id as ._id`)

  t.end()
})

test('balances', (t) => {

  t.test('"New" account', (_t) => {
    const o = { id: '1234' }
    const acct = new Account(o, TOKENS)
    t.ok(BigNumber.isBigNumber(acct.balances[TOKENS[0]]), 'Should be a BigNumber instance')
    t.ok(BigNumber.isBigNumber(acct.balances[TOKENS[1]]), 'Should be a BigNumber instance')
    t.ok(BigNumber.isBigNumber(acct.balances[TOKENS[2]]), 'Should be a BigNumber instance')
    _t.end()
  })

  t.test('"Existing" account', (_t) => {
    // Reinstantiate BigNumber instances, i.e retrieving from a db
    const _acct = {
      _id: '1234',
      balances: {
        // Simulate what a BigNumber object looks like after retrieval from a db
        [TOKENS[0]]: { ...BigNumber(100) },
        [TOKENS[1]]: { ...BigNumber(100) },
        [TOKENS[2]]: { ...BigNumber(100) }
      }
    }

    const acct = new Account(_acct, TOKENS)
    t.ok(BigNumber.isBigNumber(acct.balances[TOKENS[0]]), 'Should be a BigNumber instance')
    t.ok(BigNumber.isBigNumber(acct.balances[TOKENS[1]]), 'Should be a BigNumber instance')
    t.ok(BigNumber.isBigNumber(acct.balances[TOKENS[2]]), 'Should be a BigNumber instance')

    _t.end()
  })

  t.end()
})

test('#credit', (t) => {
  const token = TOKENS[0]
  const amount = 100
  const acct = new Account('1', TOKENS)
  const acctAfter = acct.credit(token, amount)
  t.notSame(acct, acctAfter, `Creates new account object`)
  t.equal(0, acct.balances[token].toNumber(), `Doesn't mutate original object's balances`)
  t.ok(BigNumber.isBigNumber(acctAfter.balances[token]), 'Should be a BigNumber instance')
  t.equal(amount, acctAfter.balances[token].toNumber(), `Creates new object w/ new balances`)
  t.end()
})

test('#debit', (t) => {
  const token = TOKENS[0]
  const amount = 100
  const balance = 1000
  let acct = new Account('1', TOKENS)
  acct = acct.credit(token, balance)
  const acctAfter = acct.debit(token, amount)
  t.notSame(acct, acctAfter, `Creates new account object`)
  t.equal(balance, acct.balances[token].toNumber(), `Doesn't mutate original object's balances`)
  t.ok(BigNumber.isBigNumber(acctAfter.balances[token]), 'Should be a BigNumber instance')
  t.equal(balance - amount, acctAfter.balances[token].toNumber(), `Creates new object w/ new balances`)
  t.end()
})

test('#balanceSufficient', (t) => {
  const token = TOKENS[0]
  const balance = 1000
  const acct = new Account('1', TOKENS)
  acct.balances[token] = balance
  t.ok(acct.balanceSufficient(token, 100))
  t.ok(acct.balanceSufficient(token, 999.999))
  t.ok(acct.balanceSufficient(token, 1000))
  t.notOk(acct.balanceSufficient(token, 1001))
  t.notOk(acct.balanceSufficient(token, 1000.1))
  t.end()
})
