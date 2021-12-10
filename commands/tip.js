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
      } else if (/^\d?.?\d+$/i.test(val) || val === 'all') {
        obj.amount = val
      } else if (val === 'each') {
        obj.modifier = val
      } else {
        obj.token = val
      }
      return obj
    }, {})
  }
}
