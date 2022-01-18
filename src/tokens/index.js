import { env } from '../lib/env.js'
import { DorkBucks } from './dorkbucks.js'
import { Ananos } from './ananos.js'
import { Manangos } from './manangos.js'
import { Beaver } from './beaver.js'
import { Dodo } from './dodo.js'
import { Hippopotamus } from './hippopotamus.js'
import { Llama } from './llama.js'


const TOKENS = env.NODE_ENV === 'production' ? [
  DorkBucks,
  Ananos,
  Manangos
] : [
  Beaver,
  Dodo,
  Hippopotamus,
  Llama
]

const lc = t => t.toLowerCase()

function get (str, ...props) {
  if (!props.length) return []
  str = lc(str)
  const token = TOKENS.filter(({ aliases }) => aliases.map(lc).includes(str))[0]
  if (!token) return []
  return props.map((prop) => {
    if (prop in token) {
      return token[prop]
    }
  })
}

function list (...props) {
  if (props.length < 1) props.push('name')
  return TOKENS.map((token) => props.reduce((t, prop) => {
    t[prop] = token[prop]
    return t
  }, {}))
}

function isSupported (str='') {
  return !!get(str, 'name').length
}

export const tokens = {
  get,
  list,
  isSupported
}
