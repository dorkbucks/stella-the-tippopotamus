import tap from 'tap'

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
const sender = createFundedAccount()
const address = `GC6SOPXA7X7LDKJK3SDHL6MQEQLOHF23G5CN2MLT4MJ2UPFUSKRKIURG`
let withdrawal = new WithdrawalRequest()

var parsedArgs = withdrawal.parseArgs(['100', 'dork', address])
tap.equal(parsedArgs.amount, 100)
tap.equal(parsedArgs.token, 'dork')
tap.equal(parsedArgs.address, address)

var parsedArgs = withdrawal.parseArgs(['100k', 'dork', address])
tap.equal(parsedArgs.amount, 100000)
tap.equal(parsedArgs.token, 'dork')
tap.equal(parsedArgs.address, address)

var parsedArgs = withdrawal.parseArgs(['all', 'dork', address])
tap.equal(parsedArgs.amount, 'all')
tap.equal(parsedArgs.token, 'dork')
tap.equal(parsedArgs.address, address)

var parsedArgs = withdrawal.parseArgs(['dork', '100', address])
tap.equal(parsedArgs, null)
