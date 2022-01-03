export function randomAlphanumericChar() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return alphabet.charAt(Math.floor(Math.random() * alphabet.length))
}

export function randomAlphanumericString(length: number)
{
  return [...Array(length).keys()].map((item) => randomAlphanumericChar()).join('')
}
