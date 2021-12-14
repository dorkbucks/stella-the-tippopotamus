import { test } from 'tap'

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
  t.same(balances, acct.balances)
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
  t.same(balances, acct.balances)

  const obj2 = { _id: '1234' }
  const acct2 = new Account(obj2, TOKENS)
  t.equal(obj2._id, acct2._id, `Saves ._id as ._id`)
  t.notOk(acct2.id, `Saves ._id as ._id`)

  t.end()
})

test('#credit', (t) => {
  const token = TOKENS[0]
  const amount = 100
  const acct = new Account('1', TOKENS)
  const acctAfter = acct.credit(token, amount)
  t.notSame(acct, acctAfter, `Creates new account object`)
  t.equal(0, acct.balances[token], `Doesn't mutate original object's balances`)
  t.equal(amount, acctAfter.balances[token], `Creates new object w/ new balances`)
  t.end()
})

test('#debit', (t) => {
  const token = TOKENS[0]
  const amount = 100
  const balance = 1000
  const acct = new Account('1', TOKENS)
  acct.balances[token] = balance
  const acctAfter = acct.debit(token, amount)
  t.notSame(acct, acctAfter, `Creates new account object`)
  t.equal(balance, acct.balances[token], `Doesn't mutate original object's balances`)
  t.equal(balance - amount, acctAfter.balances[token], `Creates new object w/ new balances`)
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
