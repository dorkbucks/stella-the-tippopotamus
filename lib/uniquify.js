export function uniquify (arr) {
  return arr.length > 1 ? [...new Set(arr)] : arr
}
