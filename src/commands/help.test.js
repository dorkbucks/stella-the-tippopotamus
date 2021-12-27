import { test } from 'tap'

import { Help } from './help.js'


test('#parseArgs', (t) => {
  const help = new Help()

  t.test('Defaults to index topic', (_t) => {
    const parsedArgs = help.parseArgs([])
    t.equal('index', parsedArgs.topic)
    _t.end()
  })

  t.test('sigil-less topic', (_t) => {
    const parsedArgs = help.parseArgs(['tip'])
    t.equal('tip', parsedArgs.topic)
    _t.end()
  })

  t.test('sigil-prefixed topic', (_t) => {
    const parsedArgs = help.parseArgs(['.tip'])
    t.equal('tip', parsedArgs.topic)
    _t.end()
  })


  t.test('Extra text', (_t) => {
    const parsedArgs = help.parseArgs(['.tip', 'extra', 'text'])
    t.equal('tip', parsedArgs.topic)
    _t.end()
  })

  t.end()
})
