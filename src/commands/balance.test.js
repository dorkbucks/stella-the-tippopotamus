import { test } from 'tap'

import { BigNumber } from '../lib/proxied_bignumber.js'
import { tokens } from '../tokens/index.js'
import { Account } from '../lib/account.js'
import { Balance } from './balance.js'


const TOKENS = tokens.list('name')

test('Balance', (t) => {
  const account = new Account({
    _id: '1234',
    username: 'rubberdork',
    avatar: 'avatar.png',
    balances: TOKENS.reduce((o, token) => {
      o[token.name] = { ...BigNumber(10000.01) }
      return o
    }, {})
  }, TOKENS)

  const bal = new Balance()
  const { message: { heading, icon, body } } = bal.call(account)
  t.equal(heading, `${account.username}'s balances`)
  t.equal(icon, account.avatar)
  const match = body.match(/10,000.01/g)
  t.equal(match.length, TOKENS.length)
  t.end()
})
