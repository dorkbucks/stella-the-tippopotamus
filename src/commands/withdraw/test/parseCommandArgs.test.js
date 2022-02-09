import { default as t } from 'tap'

import { parseCommandArgs } from '../parseCommandArgs.js'


const address = 'GC6SOPXA7X7LDKJK3SDHL6MQEQLOHF23G5CN2MLT4MJ2UPFUSKRKIURG'
const memoID = '8008135'
const memoText = 'Lorememo ipsumemo'

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
    ['dork', '100', address],
    [address, 'dork', '100'],
    ['100', address, 'dork'],
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

t.test('Valid commands', ({ end }) => {
  const theories = [
    {
      args: { commandArgs: ['100', 'dork', address] },
      expected: { amount: '100', token: 'dork', address }
    },
    {
      args: { commandArgs: ['100k', 'dork', address] },
      expected: { amount: '100k', token: 'dork', address }
    },
    {
      args: { commandArgs: ['all', 'dork', address] },
      expected: { amount: 'all', token: 'dork', address }
    },
    {
      args: { commandArgs: ['all', 'dork', address, memoID] },
      expected: { amount: 'all', token: 'dork', address, memo: memoID }
    },
    {
      args: { commandArgs: ['all', 'dork', address, memoText] },
      expected: { amount: 'all', token: 'dork', address, memo: memoText }
    },

    // Kind of a special case. If the parser can't recognize an address it won't
    // throw, it'll just not add an address. Let the validator do the
    // validating.
    {
      args: { commandArgs: ['all', 'dork', 'GCCNDORK'] },
      expected: { amount: 'all', token: 'dork' }
    },
  ]

  theories.forEach(({ args, expected }) => {
    const parsedArgs = parseCommandArgs(args)
    t.same(parsedArgs, expected)
  })
  end()
})
