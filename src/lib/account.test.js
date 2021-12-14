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
