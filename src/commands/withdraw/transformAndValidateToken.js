import { tokens } from '../../tokens/index.js'


export function transformAndValidateToken (args) {
  const [ tokenName ] = tokens.get(args.token, 'name')

  if (!tokens.isSupported(tokenName)) {
    throw new Error(`${args.token} is not a supported token`)
  }

  const [ code, issuer ] = tokens.get(tokenName, 'code', 'issuer')
  return {
    ...args,
    token: {
      name: tokenName,
      code,
      issuer
    }
  }
}
