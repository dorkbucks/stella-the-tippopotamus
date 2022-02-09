import { default as t } from 'tap'

import { transformAndValidateToken } from '../transformAndValidateToken.js'
import { Hippopotamus } from '../../../tokens/hippopotamus.js'


const args = {
  token: 'hippo',
  prop1: 'prop1',
  prop2: 'prop2'
}

t.test('Unsupported token', ({ end }) => {
  t.throws(
    () => transformAndValidateToken({ token: 'bork' }),
    new Error('bork is not a supported token'),
    'Should throw if token is unrecognized'
  )
  end()
})

t.test('Supported token', ({ end }) => {
  const parsed = transformAndValidateToken(args)
  const { token } = parsed
  t.equal(token.name, Hippopotamus.name, `Should get "proper" name`)
  t.equal(token.code, Hippopotamus.code, 'Should get asset code')
  t.equal(token.issuer, Hippopotamus.issuer, 'Should get issuer address')
  t.equal(args.token, 'hippo', 'Should not mutate original args object')
  t.equal(parsed.prop1, args.prop1, 'Should copy over other props from args object')
  t.equal(parsed.prop2, args.prop2, 'Should copy over other props from args object')
  end()
})
