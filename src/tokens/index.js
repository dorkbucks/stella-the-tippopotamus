import { DorkBucks } from './dorkbucks.js'
import { Ananos } from './ananos.js'
import { Manangos } from './manangos.js'


const TOKENS = [
  DorkBucks,
  Ananos,
  Manangos
]

const lc = t => t.toLowerCase()

function get (str, prop) {
  if (!prop) return
  str = lc(str)
  const token = TOKENS.filter(({ aliases }) => aliases.map(lc).includes(str))[0]
  if (!token) return
  if (prop in token) {
    return token[prop]
  }
}

function list (...props) {
  if (props.length < 1) props.push('name')
  return TOKENS.map((token) => props.reduce((t, prop) => {
    t[prop] = token[prop]
    return t
  }, {}))
}

function isSupported (str='') {
  return !!get(str, 'name')
}

export const tokens = {
  get,
  list,
  isSupported
}
