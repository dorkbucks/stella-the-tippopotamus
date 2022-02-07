export function composeAsync (...fns) {
  return (args) => fns.reduce(
    (args, fn) => Promise.resolve(args).then(fn),
    args
  )
}
