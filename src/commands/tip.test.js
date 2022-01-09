import { test } from 'tap'

import { BigNumber } from '../lib/proxied_bignumber.js'
import { Account } from '../lib/account.js'
import { tokens } from '../tokens/index.js'
import { Tip } from './tip.js'
import { parseCommand } from './index.js'


const TOKENS = tokens.list()

function createFundedAccount () {
  return TOKENS.reduce(
    (acct, { name }) => acct.credit(name, 10000),
    new Account({ id: '1234' }, TOKENS)
  )
}

test('#parseArgs', (t) => {
  const tip = new Tip({}, [])
  const id1 = '788381709112573982'
  const id2 = '564377836685754380'

  t.test('1 recipient', (_t) => {
    const { args } = parseCommand('.', `.tip <@!${id1}> 100 dork`)
    const parsedArgs = tip.parseArgs(args)
    t.ok(parsedArgs.recipientIDs.includes(id1))
    t.equal(100, parsedArgs.amount)
    t.equal('dork', parsedArgs.token)
    _t.end()
  })

  t.test('2 recipients', (_t) => {
    const { args } = parseCommand('.', `.tip <@!${id1}> <@!${id2}> 100 dork`)
    const parsedArgs = tip.parseArgs(args)
    t.ok(parsedArgs.recipientIDs.includes(id1))
    t.ok(parsedArgs.recipientIDs.includes(id2))
    t.equal(100, parsedArgs.amount)
    t.equal('dork', parsedArgs.token)
    _t.end()
  })

  t.test('Multiple comma-separated recipients', (_t) => {
    const { args } = parseCommand('.', `.tip <@!${id1}>, <@!${id2}> 100 dork`)
    const parsedArgs = tip.parseArgs(args)
    t.ok(parsedArgs.recipientIDs.includes(id1))
    t.ok(parsedArgs.recipientIDs.includes(id2))
    t.equal(100, parsedArgs.amount)
    t.equal('dork', parsedArgs.token)
    _t.end()
  })

  t.test('k|m|b suffixed amounts', (_t) => {
    var { args } = parseCommand('.', `.tip <@!${id1}> 10k dork`)
    var parsedArgs = tip.parseArgs(args)
    t.equal(10000, parsedArgs.amount)

    var { args } = parseCommand('.', `.tip <@!${id1}> 10m dork`)
    var parsedArgs = tip.parseArgs(args)
    t.equal(10000000, parsedArgs.amount)

    var { args } = parseCommand('.', `.tip <@!${id1}> 1b dork`)
    var parsedArgs = tip.parseArgs(args)
    t.equal(1000000000, parsedArgs.amount)

    var { args } = parseCommand('.', `.tip <@!${id1}> 1.6k dork`)
    var parsedArgs = tip.parseArgs(args)
    t.equal(1600, parsedArgs.amount)

    var { args } = parseCommand('.', `.tip <@!${id1}> 10.3m dork`)
    var parsedArgs = tip.parseArgs(args)
    t.equal(10300000, parsedArgs.amount)

    var { args } = parseCommand('.', `.tip <@!${id1}> 10.42b dork`)
    var parsedArgs = tip.parseArgs(args)
    t.equal(10420000000, parsedArgs.amount)

    _t.end()
  })

  t.test('Decimal amounts', (_t) => {
    var { args } = parseCommand('.', `.tip <@!${id1}> 0.12345678 dork`)
    var parsedArgs = tip.parseArgs(args)
    t.equal(0.12345678, parsedArgs.amount)

    var { args } = parseCommand('.', `.tip <@!${id1}> 1.12 dork`)
    var parsedArgs = tip.parseArgs(args)
    t.equal(1.12, parsedArgs.amount)

    var { args } = parseCommand('.', `.tip <@!${id1}> 42.8008 dork`)
    var parsedArgs = tip.parseArgs(args)
    t.equal(42.8008, parsedArgs.amount)

    var { args } = parseCommand('.', `.tip <@!${id1}> 798007.6666666 dork`)
    var parsedArgs = tip.parseArgs(args)
    t.equal(798007.6666666, parsedArgs.amount)

    _t.end()
  })

  t.test('"all" amount', (_t) => {
    const { args } = parseCommand('.', `.tip <@!${id1}> all dork`)
    const parsedArgs = tip.parseArgs(args)
    t.ok(parsedArgs.recipientIDs.includes(id1))
    t.equal('all', parsedArgs.amount)
    _t.end()
  })

  t.test('"each" modifier', (_t) => {
    const { args } = parseCommand('.', `.tip <@!${id1}> 100 dork each`)
    const parsedArgs = tip.parseArgs(args)
    t.ok(parsedArgs.recipientIDs.includes(id1))
    t.equal(100, parsedArgs.amount)
    t.equal('dork', parsedArgs.token)
    t.equal('each', parsedArgs.modifier)
    _t.end()
  })

  t.test('Enforce argument order', (_t) => {
    var { args } = parseCommand('.', `.tip <@!${id1}> dork 100`)
    t.same(tip.parseArgs(args), null)

    var { args } = parseCommand('.', `.tip 100 dork <@!${id1}>`)
    t.same(tip.parseArgs(args), null)

    var { args } = parseCommand('.', `.tip 100 <@!${id1}> dork`)
    t.same(tip.parseArgs(args), null)

    var { args } = parseCommand('.', `.tip dork <@!${id1}> 100`)
    t.same(tip.parseArgs(args), null)

    var { args } = parseCommand('.', `.tip dork 100 <@!${id1}>`)
    t.same(tip.parseArgs(args), null)

    _t.end()
  })

  t.test('Recipient passed in', (_t) => {
    const recipient = { id: id1 }

    t.test('valid command', (_t) => {
      const { args } = parseCommand('.', `.tip 100 dork`)
      const parsedArgs = tip.parseArgs(args, recipient)
      t.equal(100, parsedArgs.amount)
      t.equal('dork', parsedArgs.token)
      _t.end()
    })

    t.test('ignore each modifier', (_t) => {
      const { args } = parseCommand('.', `.tip 100 dork each`)
      const parsedArgs = tip.parseArgs(args, recipient)
      t.equal(100, parsedArgs.amount)
      t.equal('dork', parsedArgs.token)
      t.notOk(parsedArgs.modifier)
      _t.end()
    })

    t.test('token first', (_t) => {
      const { args } = parseCommand('.', `.tip dork 100`)
      const parsedArgs = tip.parseArgs(args, recipient)
      t.same(parsedArgs, null)
      _t.end()
    })

    t.test('includes user id', (_t) => {
      const { args } = parseCommand('.', `.tip <@!${id1}> 100 dork`)
      const parsedArgs = tip.parseArgs(args, recipient)
      t.same(parsedArgs, null)
      _t.end()
    })

    _t.end()
  })

  t.test('active classifier', (_t) => {
    t.test('valid command', (_t) => {
      const { args } = parseCommand('.', `.tip active 100 dork`)
      const parsedArgs = tip.parseArgs(args)
      t.equal('active', parsedArgs.classifier)
      t.equal(100, parsedArgs.amount)
      t.equal('dork', parsedArgs.token)
      _t.end()
    })

    t.test('valid command + each', (_t) => {
      const { args } = parseCommand('.', `.tip active 100 dork each`)
      const parsedArgs = tip.parseArgs(args)
      t.equal('active', parsedArgs.classifier)
      t.equal(100, parsedArgs.amount)
      t.equal('dork', parsedArgs.token)
      t.equal('each', parsedArgs.modifier)
      _t.end()
    })

    t.test('wrong order', (_t) => {
      const { args } = parseCommand('.', `.tip active dork 100 each`)
      const parsedArgs = tip.parseArgs(args)
      t.same(parsedArgs, null)
      _t.end()
    })

    t.test('wrong order', (_t) => {
      const { args } = parseCommand('.', `.tip 100 active dork`)
      const parsedArgs = tip.parseArgs(args)
      t.same(parsedArgs, null)
      _t.end()
    })

    _t.end()
  })

  t.test('@everyone classifier', (_t) => {
    t.test('valid command', (_t) => {
      const { args } = parseCommand('.', `.tip @everyone 100 dork`)
      const parsedArgs = tip.parseArgs(args)
      t.equal('everyone', parsedArgs.classifier)
      t.equal(100, parsedArgs.amount)
      t.equal('dork', parsedArgs.token)
      _t.end()
    })

    t.test('valid command; no @', (_t) => {
      const { args } = parseCommand('.', `.tip everyone 100 dork`)
      const parsedArgs = tip.parseArgs(args)
      t.equal('everyone', parsedArgs.classifier)
      t.equal(100, parsedArgs.amount)
      t.equal('dork', parsedArgs.token)
      _t.end()
    })

    t.test('valid command + each', (_t) => {
      const { args } = parseCommand('.', `.tip @everyone 100 dork each`)
      const parsedArgs = tip.parseArgs(args)
      t.equal('everyone', parsedArgs.classifier)
      t.equal(100, parsedArgs.amount)
      t.equal('dork', parsedArgs.token)
      t.equal('each', parsedArgs.modifier)
      _t.end()
    })

    t.test('wrong order', (_t) => {
      const { args } = parseCommand('.', `.tip @everyone dork 100 each`)
      const parsedArgs = tip.parseArgs(args)
      t.same(parsedArgs, null)
      _t.end()
    })

    t.test('wrong order', (_t) => {
      const { args } = parseCommand('.', `.tip 100 @everyone dork`)
      const parsedArgs = tip.parseArgs(args)
      t.same(parsedArgs, null)
      _t.end()
    })

    _t.end()
  })

  t.end()
})

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
    const tokenName = 'DorkBucks'
    const isEach = false
    const [totalAmount, amountPer] = tip.calcAmounts({
      sender, recipients, tokenName, amount, isAll, isEach
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
