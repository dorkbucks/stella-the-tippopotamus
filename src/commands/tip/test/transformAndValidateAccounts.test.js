import { default as t } from 'tap'

import { transformAndValidateAccounts } from '../transformAndValidateAccounts.js'


t.test('Self tipping', ({ end }) => {
  const args = [
    {
      sender: { id: '1' },
      recipients: [{ id: '1' }]
    },
    {
      sender: { id: '1' },
      recipients: [{ id: '1' }, { id: '2' }]
    },
    {
      sender: { id: '1' },
      recipients: ['1']
    },
    {
      sender: { id: '1' },
      recipients: ['1', '2']
    }
  ]

  args.forEach((arg) => {
    t.rejects(
      transformAndValidateAccounts(arg),
      new Error(`You can't tip yourself`),
      'Should throw if sender is included in recipients'
    )
  })
  end()
})
