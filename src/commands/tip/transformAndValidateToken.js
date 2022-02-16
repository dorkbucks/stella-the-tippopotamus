import { tokens } from '../../tokens/index.js'
import { BigNumber } from '../../lib/proxied_bignumber.js'
import { CommandError } from '../errors.js'


export function transformAndValidateToken (args) {
  const [ tokenName ] = tokens.get(args.token, 'name')

  if (!tokens.isSupported(tokenName)) {
    throw new CommandError(`${args.token} is not a supported token`)
  }

  const [ minTip, logo ] = tokens.get(tokenName, 'minimumTip',  'logo')
  return {
    ...args,
    token: {
      name: tokenName,
      minimumTip: BigNumber(minTip),
      logo
    }
  }
}
