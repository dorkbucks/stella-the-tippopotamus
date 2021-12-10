import { expandSuffixedNum } from '../lib/expand_suffixed_num.js'


export class Tip {
  constructor (fromID, args) {
    Object.assign(this, this.parseArgs(args), { fromID })
  }

  parseArgs (args) {
    return args.reduce((obj, val) => {
      val = val.toLowerCase()
      const user = val.match(/^<@!?(?<id>\d{17,19})>$/)
      if (user) {
        obj.toIDs = [...(obj.toIDs || []), user.groups.id]
      } else if (/^\d?.?\d+[k|m|b]?$|all?\b/i.test(val)) {
        obj.amount = val === 'all' ? val : expandSuffixedNum(val)
      } else if (val === 'each') {
        obj.modifier = val
      } else {
        obj.token = val
      }
      return obj
    }, {})
  }
}
