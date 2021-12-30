import { test } from 'tap'

import { BigNumber } from './proxied_bignumber.js'
import { Account } from './account.js'
import { tokens } from '../tokens/index.js'


const TOKENS = tokens.list()

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

test('Constructor is idempotent', (t) => {
  const id = '1234'
  const acctOrig = new Account(id, TOKENS)
  const acctNew = new Account(acctOrig, TOKENS)
  t.equal(acctOrig, acctNew)
  t.end()
})


test('balances', (t) => {

  t.test('"New" account', (_t) => {
    const o = { id: '1234' }
    const acct = new Account(o, TOKENS)
    TOKENS.forEach(({ name }) => {
      t.ok(BigNumber.isBigNumber(acct.balances[name]), 'Should be a BigNumber instance')
    })
    _t.end()
  })

  t.test('"Existing" account', (_t) => {
    // Reinstantiate BigNumber instances, i.e retrieving from a db
    const _acct = {
      _id: '1234',
      // Simulate what a BigNumber object looks like after retrieval from a db
      balances: TOKENS.reduce((o, { name }) => {
        o[name] = { ...BigNumber(100) }
        return o
      }, {})
    }

    const acct = new Account(_acct, TOKENS)
    TOKENS.forEach(({ name }) => {
      t.ok(BigNumber.isBigNumber(acct.balances[name]), 'Should be a BigNumber instance')
    })

    _t.end()
  })

  t.end()
})

test('#credit', (t) => {
  const token = TOKENS[0].name
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
  const token = TOKENS[0].name
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
  const token = TOKENS[0].name
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
