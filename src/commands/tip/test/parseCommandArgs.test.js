import { default as t } from 'tap'

import { parseCommandArgs } from '../parseCommandArgs.js'


const id1 = '788381709112573982'
const id2 = '564377836685754380'
const id3 = '849862447418441749'

t.test('No args', ({ end }) => {
  t.throws(
    () => parseCommandArgs({ commandArgs: [] }),
    new Error('No command arguments'),
    'Should throw on an empty command'
  )
  end()
})

t.test('Wrong arg order', ({ end }) => {
  const commands = [
    ['dork', '1m', `<@!${id1}>`],
    [`<@!${id1}>`, 'dork', '1m'],
    [`<@!${id1}>`, 'hippo', `<@!${id2}>`, '100'],
    [`<@!${id1}>`, '100', 'hippo', `<@!${id2}>`],
    [`<@!${id1}>`, `<@!${id2}>`, 'each', '100', 'hippo'],
    ['active', 'each', '100', 'hippo'],
    ['active', '100', 'each', 'hippo'],
  ]
  commands.forEach((commandArgs) => {
    t.throws(
      () => parseCommandArgs({ commandArgs }),
      new Error(`I don't understand what you mean`),
      'Should throw on incorrect command order'
    )
  })
  end()
})

t.test('1 recipient', ({ end }) => {
  const commandArgs = [`<@!${id1}>`, '100', 'dork']
  const { recipients, amount, token } = parseCommandArgs({ commandArgs })
  t.ok(recipients.includes(id1), 'Should parse discord @mentions as array of id strings')
  t.equal(amount, '100', 'Should parse amount as string')
  t.equal(token, 'dork', 'Should parse string after amount as token')
  end()
})

t.test('Multiple recipients', ({ end }) => {
  const commandArgs = [`<@!${id1}>`, `<@!${id2}>`, `<@!${id3}>`, '100', 'dork']
  const { recipients, amount, token } = parseCommandArgs({ commandArgs })
  t.ok(recipients.includes(id1), 'Should parse discord @mentions as array of id strings')
  t.ok(recipients.includes(id2), 'Should parse discord @mentions as array of id strings')
  t.ok(recipients.includes(id3), 'Should parse discord @mentions as array of id strings')
  t.equal(amount, '100', 'Should parse amount as string')
  t.equal(token, 'dork', 'Should parse string after amount as token')
  end()
})


t.test('k|m|b suffixed amounts', ({ end }) => {
  const commands = [
    [`<@!${id1}>`, '1k', 'dork'],
    [`<@!${id1}>`, '1m', 'dork'],
    [`<@!${id1}>`, '1b', 'dork']
  ]
  commands.forEach((commandArgs) => {
    const { amount } = parseCommandArgs({ commandArgs })
    t.equal(amount, commandArgs[1], 'Should parse k|m|b suffixed string as amount')
  })
  end()
})

t.test('Decimal amounts', ({ end }) => {
  const commands = [
    [`<@!${id1}>`, '0.12345678', 'dork'],
    [`<@!${id1}>`, '1.12', 'dork'],
    [`<@!${id1}>`, '42.8008', 'dork'],
    [`<@!${id1}>`, '798007.6666666', 'dork']
  ]
  commands.forEach((commandArgs) => {
    const { amount } = parseCommandArgs({ commandArgs })
    t.equal(amount, commandArgs[1], 'Should parse decimals as amount')
  })
  end()
})

t.test('"all" amount', ({ end }) => {
  const commandArgs = [`<@!${id1}>`, 'all', 'dork']
  const { amount } = parseCommandArgs({ commandArgs })
  t.equal(amount, 'all', 'Should parse "all" as amount')
  end()
})

t.test('"each" modifier', ({ end }) => {
  const commandArgs = [`<@!${id1}>`, `<@!${id2}>`, '100', 'dork', 'each']
  const { modifier } = parseCommandArgs({ commandArgs })
  t.equal(modifier, 'each', 'Should parse "each" as modifier')
  end()
})

t.test('active classifier', ({ end }) => {
  const commandArgs = ['active', '100', 'dork']
  const { classifier } = parseCommandArgs({ commandArgs })
  t.equal(classifier, 'active', 'Should parse "active" as classifier')
  end()
})

t.test('{@,}everyone classifier', ({ end }) => {
  const commands = [
    ['@everyone', '100', 'dork'],
    ['everyone', '100', 'dork']
  ]
  commands.forEach((commandArgs) => {
    const { classifier } = parseCommandArgs({ commandArgs })
    t.equal(classifier, 'everyone', 'Should parse "@everyone" and "everyone" as classifier')
  })
  end()
})

t.test('Recipient passed in', ({ end }) => {
  const recipient = { id: id1 }

  t.test('Recipient passed in - valid command', ({ end }) => {
    const commandArgs = ['100', 'dork']
    const parsedArgs = parseCommandArgs({ recipient, commandArgs })
    t.ok(parsedArgs.recipients.includes(recipient), 'Should add passed-in recipient to recipients array')
    t.notOk(parsedArgs.recipient, 'Should not include recipient prop')
    end()
  })

  t.test('Recipient passed in - amount must be first', ({ end }) => {
    const commands = [
      ['dork', '100'],
      [`<@!${id1}>`, '100', 'dork']
    ]
    commands.forEach((commandArgs) => {
      t.throws(
        () => parseCommandArgs({ recipient, commandArgs }),
        new Error(`I don't understand what you mean`),
        '"amount" should be first when recipient is passed in'
      )
    })
    end()
  })

  end()
})
