export class Queue {
  constructor () {
    this.prev = Promise.resolve()
  }

  add (fn) {
    let next = this.prev.then(() => fn())
    this.prev = next.catch(() => {})
    return next
  }
}
