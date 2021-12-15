import dotenv from 'dotenv'
dotenv.config()

import { default as Big } from 'bignumber.js'

const DECIMAL_PLACES = 7

Big.config({
  DECIMAL_PLACES,
  ROUNDING_MODE: Big.ROUND_DOWN,
  EXPONENTIAL_AT: [-8, 20],
})

Big.DEBUG = process.env.NODE_ENV !== 'production'

export default new Proxy(Big, {
  construct: function (target, args) {
    return target(...args).decimalPlaces(DECIMAL_PLACES)
  },
  apply: function (target, that, args) {
    return this.construct(target, args)
  }
})
