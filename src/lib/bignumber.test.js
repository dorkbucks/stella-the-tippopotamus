import tap from 'tap'
import { default as TheRealBigNumber } from 'bignumber.js'

import BigNumber from './bignumber.js'


const d = 0.00000019
const bigd = BigNumber(d)

tap.ok(bigd instanceof TheRealBigNumber)
tap.equal(0.0000001, bigd.toNumber(), 'Rounds down to 7 decimal places')
