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
  str = lc(str)
  const token = TOKENS.filter(({ aliases }) => aliases.map(lc).includes(str))[0]
  if (!token) return null
  if (prop && prop in token) {
    return token[prop]
  }
  return token
}

function list (by='name') {
  return TOKENS.map(t => t[by])
}

function isSupported (str) {
  return !!get(str)
}

export const tokens = {
  get,
  list,
  isSupported
}
