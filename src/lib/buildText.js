export function buildText (template, values) {
  return Object.entries(values).reduce((str, [key, value]) => str.replace(
    new RegExp(`{{${key}}}`, 'g'),
    value
  ), template)
}
