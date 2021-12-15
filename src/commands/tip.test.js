import { test } from 'tap'

import { BigNumber } from '../lib/proxied_bignumber.js'
import { Account } from '../lib/account.js'
import { tokens } from '../tokens/index.js'
import { Tip } from './tip.js'


const TOKENS = tokens.list()

function createFundedAccount () {
  let account = new Account({ id: '1234' }, TOKENS)
  TOKENS.forEach(({ name }) => {
    account = account.credit(name, 10000)
  })
  return account
}

test('#calcAmounts', (t) => {
  const sender = createFundedAccount()
  const tip = new Tip(sender, [])
  const token = 'DorkBucks'

  t.test('One recipient', (_t) => {
    const recipients = ['1']
    const amount = 1000
    const isAll = false
    const isEach = false
    const [totalAmount, amountPer] = tip.calcAmounts({
      sender, recipients, token, amount, isAll, isEach
    })
    t.equal(totalAmount.toNumber(), amount)
    t.equal(amountPer.toNumber(), amount)
    _t.end()
  })

  t.test('Three recipients', (_t) => {
    const recipients = ['1', '2', '3']
    const amount = 1000
    const isAll = false
    const isEach = false
    const [totalAmount, amountPer] = tip.calcAmounts({
      sender, recipients, token, amount, isAll, isEach
    })
    t.equal(totalAmount.toNumber(), amount)
    t.equal(amountPer.toNumber(), 333.3333333)
    _t.end()
  })


  t.test('all', (_t) => {
    const sender = createFundedAccount()
    const recipients = ['1', '2']
    const amount = 'all'
    const isAll = true
    const isEach = false
    const [totalAmount, amountPer] = tip.calcAmounts({
      sender, recipients, token, amount, isAll, isEach
    })
    t.equal(totalAmount.toNumber(), 10000)
    t.equal(amountPer.toNumber(), 5000)
    _t.end()
  })

  t.test('each', (_t) => {
    const sender = createFundedAccount()
    const recipients = ['1', '2']
    const amount = 500
    const isAll = false
    const isEach = true
    const [totalAmount, amountPer] = tip.calcAmounts({
      sender, recipients, token, amount, isAll, isEach
    })
    t.equal(totalAmount.toNumber(), 1000)
    t.equal(amountPer.toNumber(), 500)
    _t.end()
  })

  t.end()
})
