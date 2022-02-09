import { default as t } from 'tap'
import { Memo } from 'stellar-sdk'

import { transformAndValidateMemo } from '../transformAndValidateMemo.js'


const validMemoID = '8008135'
const validMemoText = 'Lorememo ipsumemo'
const invalidMemoID = '800B135'
const invalidMemoText = Buffer.alloc(29, '.').toString()

t.test('No memo', ({ end }) => {
  const args = { prop: 1}
  t.same(transformAndValidateMemo(args), args, 'Should return original args if no memo')
  end()
})

t.test('Invalid memo', ({ end }) => {
  t.throws(
    () => transformAndValidateMemo({ memo: invalidMemoText }),
    new Error('Memo is invalid'),
    'Should throw if invalid Memo text'
  )
  end()
})

t.test('Valid memo id', ({ end }) => {
  const { memo } = transformAndValidateMemo({ memo: validMemoID })
  t.type(memo, Memo, 'Should be instance of Memo')
  t.same(memo, { _type: 'id', _value: validMemoID }, 'Should be memo id type')
  end()
})

t.test('Valid memo text', ({ end }) => {
  const { memo } = transformAndValidateMemo({ memo: validMemoText })
  t.type(memo, Memo, 'Should be instance of Memo')
  t.same(memo, { _type: 'text', _value: validMemoText }, 'Should be memo text type')
  end()
})

t.test('Invalid memo id fallback to text', ({ end }) => {
  const { memo } = transformAndValidateMemo({ memo: invalidMemoID })
  t.type(memo, Memo, 'Should be instance of Memo')
  t.same(memo, { _type: 'text', _value: invalidMemoID }, 'Should be memo text type')
  end()
})
