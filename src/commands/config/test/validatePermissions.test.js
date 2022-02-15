import { default as t } from 'tap'

import { validatePermissions } from '../validatePermissions.js'


const mockIsAdmin = (bool) => ({
  sender: {
    permissions: {
      has: () => bool
    }
  }
})

t.throws(
  () => validatePermissions(mockIsAdmin(false)),
  new Error('You need **Administrator** permissions use this command'),
  'Should throw if sender is not an admin'
)

const args = { ...mockIsAdmin(true), prop1: 1, prop2: 2 }
t.same(validatePermissions(args), args, 'Should return args if sender is admin')
