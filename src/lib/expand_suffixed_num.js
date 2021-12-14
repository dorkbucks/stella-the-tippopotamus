export function expandSuffixedNum (num) {
  const [n, suffix] = num.split(/(?=[k|m|b])/i)
  if (!suffix) return parseFloat(n)
  const multiplier = {
    k: 1000,
    m: 1000000,
    b: 10000000
  }
  return parseFloat(n) * multiplier[suffix.toLowerCase()]
}
