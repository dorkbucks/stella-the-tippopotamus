import { Memo } from 'stellar-sdk'

import { CommandError } from '../errors.js'


export function transformAndValidateMemo (args) {
  const { memo } = args

  if (!memo) return args

  let _memo
  try {
    _memo = Memo.id(memo)
  } catch {
    try {
      _memo = Memo.text(memo)
    } catch {
      throw new CommandError('Memo is invalid')
    }
  }

  return {
    ...args,
    memo: _memo
  }
}
