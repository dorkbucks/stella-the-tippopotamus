import tap from 'tap'

import { tokens } from './index.js'


const tokenList = tokens.list('name', 'logo', 'issuer')
tokenList.forEach((token) => {
  const keys = Object.keys(token)
  tap.equal(keys.length, 3)
  tap.ok(token.hasOwnProperty('name'))
  tap.ok(token.hasOwnProperty('logo'))
  tap.ok(token.hasOwnProperty('issuer'))
})

const tokenList2 = tokens.list()
tokenList2.forEach((token) => {
  const keys = Object.keys(token)
  tap.equal(keys.length, 1)
  tap.ok(token.hasOwnProperty('name'), 'Defaults to "name" prop')
})
