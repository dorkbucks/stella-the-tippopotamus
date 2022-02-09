import { default as t } from 'tap'

import { validateAddress } from '../validateAddress.js'


t.test('No address', ({ end }) => {
  t.rejects(
    validateAddress({}),
    new Error('No Stellar address provided'),
    'Should throw if no address prop'
  )
  end()
})
