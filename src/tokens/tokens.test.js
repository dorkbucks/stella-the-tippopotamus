import { test } from 'tap'

import { tokens } from './index.js'
import { Hippopotamus } from './hippopotamus.js'
import { Llama } from './llama.js'


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
  t.equal(tokens.get('hippo', 'name')[0], Hippopotamus.name, 'Get by alias')
  t.equal(tokens.get('alpaca', 'name')[0], Llama.name, 'Get by alias')

  t.equal(tokens.get('none', 'name').length, 0, 'Return empty array if non-existent token')
  t.equal(tokens.get('dork').length, 0, 'Return empty array if no prop passed')
  t.equal(tokens.get('dork', 'none')[0], undefined, 'Return undefined if non-existent prop')

  t.test('.get multiple props', (_t) => {
    var props = tokens.get('hippo', 'name', 'logo', 'issuer')
    t.equal(Hippopotamus.name, props[0])
    t.equal(Hippopotamus.logo, props[1])
    t.equal(Hippopotamus.issuer, props[2])

    var props = tokens.get('llama', 'name', 'none', 'issuer')
    t.equal(Llama.name, props[0])
    t.equal(undefined, props[1])
    t.equal(Llama.issuer, props[2])
    _t.end()
  })
  t.end()
})

test('.isSupported', (t) => {
  t.ok(tokens.isSupported('llama'))
  t.notOk(tokens.isSupported())
  t.notOk(tokens.isSupported('bork'))
  t.end()
})
