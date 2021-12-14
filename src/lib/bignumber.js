import dotenv from 'dotenv'
dotenv.config()

import BigNumber from 'bignumber.js'


BigNumber.config({
  DECIMAL_PLACES: 7,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  EXPONENTIAL_AT: [-8, 20],
})

BigNumber.DEBUG = process.env.NODE_ENV !== 'production'

export default BigNumber
