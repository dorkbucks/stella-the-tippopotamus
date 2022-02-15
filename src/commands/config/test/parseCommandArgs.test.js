import { default as t } from 'tap'

import { parseCommandArgs } from '../parseCommandArgs.js'


const theories = [
  {
    args: { commandArgs: [] },
    expected: {}
  },
  {
    args: { commandArgs: ['prefix'] },
    expected: { setting: 'prefix' }
  },
  {
    args: { commandArgs: ['prefix', '.'] },
    expected: { setting: 'prefix', value: '.' }
  },
  {
    args: { commandArgs: ['prefix', '$', 'loremipsum'] },
    expected: { setting: 'prefix', value: '$' }
  },
]

theories.forEach(({ args, expected }) => {
  const parsedArgs = parseCommandArgs(args)
  t.same(parsedArgs, expected)
})
