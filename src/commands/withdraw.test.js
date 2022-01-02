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

  var parsedArgs = withdrawal.parseArgs([])
  t.equal(parsedArgs, null)
  t.end()
})

test('validate', async (t) => {
  const mockValidateAccountTrue = () => ({isValid: true})
  const mockValidateAccountFalse = () => ({isValid: false, reason: 'Not valid'})
  const sender = createFundedAccount()
  const withdrawal = new WithdrawalRequest()
  const address = `GC6SOPXA7X7LDKJK3SDHL6MQEQLOHF23G5CN2MLT4MJ2UPFUSKRKIURG`

  await Promise.all([
    t.test('All valid; no memo', async (_t) => {
      const parsedArgs = withdrawal.parseArgs(['100', 'dork', address])
      const result = await withdrawal.validate(mockValidateAccountTrue, sender, parsedArgs)
      t.ok(result)
      _t.end()
    }),

    t.test('All valid; with memo id', async (_t) => {
      const parsedArgs = withdrawal.parseArgs(['100', 'dork', address, '123456'])
      const result = await withdrawal.validate(mockValidateAccountTrue, sender, parsedArgs)
      t.ok(result)
      _t.end()
    }),

    t.test('All valid; with memo text', async (_t) => {
      const memo = Array(29).join('d')
      const parsedArgs = withdrawal.parseArgs(['100', 'dork', address, memo])
      const result = await withdrawal.validate(mockValidateAccountTrue, sender, parsedArgs)
      t.ok(result)
      _t.end()
    }),

    t.test('No args', async (_t) => {
      try {
        const parsedArgs = withdrawal.parseArgs([])
        const x = await withdrawal.validate(mockValidateAccountTrue, sender, parsedArgs)
        t.fail('Should throw if args is empty')
      } catch(e) {
        t.ok(e)
      }
      _t.end()
    }),

    t.test('Invalid amounts', async (_t) => {
      try {
        const parsedArgs = withdrawal.parseArgs(['100b', 'dork', address])
        await withdrawal.validate(mockValidateAccountTrue, sender, parsedArgs)
        t.fail('Should throw if insufficient balance')
      } catch(e) {
        t.ok(e)
      }

      try {
        const parsedArgs = withdrawal.parseArgs(['-100', 'dork', address])
        const result = await withdrawal.validate(mockValidateAccountTrue, sender, parsedArgs)
        t.fail('Should throw on negative amount')
      } catch(e) {
        t.ok(e)
      }

      try {
        const parsedArgs = withdrawal.parseArgs(['0', 'dork', address])
        const result = await withdrawal.validate(mockValidateAccountTrue, sender, parsedArgs)
        t.fail('Should throw on 0 amount')
      } catch(e) {
        t.ok(e)
      }

      _t.end()
    }),

    t.test('Invalid token', async (_t) => {
      try {
        const parsedArgs = withdrawal.parseArgs(['100', 'bork', address])
        await withdrawal.validate(mockValidateAccountTrue, sender, parsedArgs)
        t.fail('Should throw on unsupported token')
      } catch(e) {
        t.ok(e)
      }
      _t.end()
    }),

    t.test('Invalid address', async (_t) => {
      try {
        const parsedArgs = withdrawal.parseArgs(['100', 'dork', address])
        await withdrawal.validate(mockValidateAccountFalse, sender, parsedArgs)
        t.fail('Should throw on invalid address')
      } catch(e) {
        t.ok(e)
      }
      _t.end()
    }),

    t.test('Invalid memo', async (_t) => {
      try {
        const memo = Array(100).join('d')
        const parsedArgs = withdrawal.parseArgs(['100', 'dork', address, memo])
        await withdrawal.validate(mockValidateAccountTrue, sender, parsedArgs)
        _t.fail('Should throw on memo too long for MemoID and MemoText')
      } catch(e) {
        t.ok(e)
      }

      _t.end()
    }),
  ])

  t.end()
})
