import { test } from 'tap'

import { tokens } from '../tokens/index.js'
import { Account } from '../lib/account.js'
import { WithdrawalRequest } from './withdraw.js'


function createFundedAccount () {
  let account = new Account({ id: '1234' }, TOKENS)
  TOKENS.forEach(({ name }) => {
    account = account.credit(name, 10000)
  })
  return account
}

const TOKENS = tokens.list()

test('parseArgs', (t) => {
  const sender = createFundedAccount()
  const address = `GC6SOPXA7X7LDKJK3SDHL6MQEQLOHF23G5CN2MLT4MJ2UPFUSKRKIURG`
  let withdrawal = new WithdrawalRequest()

  var parsedArgs = withdrawal.parseArgs(['100', 'dork', address])
  t.equal(parsedArgs.amount, 100)
  t.equal(parsedArgs.token, 'dork')
  t.equal(parsedArgs.address, address)

  var parsedArgs = withdrawal.parseArgs(['100k', 'dork', address])
  t.equal(parsedArgs.amount, 100000)
  t.equal(parsedArgs.token, 'dork')
  t.equal(parsedArgs.address, address)

  var parsedArgs = withdrawal.parseArgs(['all', 'dork', address])
  t.equal(parsedArgs.amount, 'all')
  t.equal(parsedArgs.token, 'dork')
  t.equal(parsedArgs.address, address)

  var parsedArgs = withdrawal.parseArgs(['dork', '100', address])
  t.equal(parsedArgs, null)

  var parsedArgs = withdrawal.parseArgs(['100', 'dork', address, 'memo message'])
  t.equal(parsedArgs.amount, 100)
  t.equal(parsedArgs.token, 'dork')
  t.equal(parsedArgs.address, address)
  t.equal(parsedArgs.memo, 'memo message')

  var parsedArgs = withdrawal.parseArgs(['100', 'dork', address, '100230'])
  t.equal(parsedArgs.amount, 100)
  t.equal(parsedArgs.token, 'dork')
  t.equal(parsedArgs.address, address)
  t.equal(parsedArgs.memo, '100230')
  t.end()
})
