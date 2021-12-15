import { test } from 'tap'

import { tokens } from './index.js'


test('.list()', (t) => {
  const tokenList = tokens.list('name', 'logo', 'issuer')
  tokenList.forEach((token) => {
    const keys = Object.keys(token)
    t.equal(keys.length, 3)
    t.ok(token.hasOwnProperty('name'))
    t.ok(token.hasOwnProperty('logo'))
    t.ok(token.hasOwnProperty('issuer'))
  })

  const tokenList2 = tokens.list()
  tokenList2.forEach((token) => {
    const keys = Object.keys(token)
    t.equal(keys.length, 1)
    t.ok(token.hasOwnProperty('name'), 'Defaults to "name" prop')
  })

  t.end()
})

test('.get', (t) => {
  t.equal(tokens.get('dork', 'name'), 'DorkBucks', 'Get by alias')
  t.equal(tokens.get('ana', 'name'), 'Ananos', 'Get by alias')

  t.equal(tokens.get('none', 'name'), undefined, 'Return undefined if non-existent token')
  t.equal(tokens.get('dork'), undefined, 'Return undefined if no prop passed')
  t.equal(tokens.get('dork', 'none'), undefined, 'Return undefined if non-existent prop')
  t.end()
})
