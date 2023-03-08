import { formatAuthor } from '../app/routes/circulars/circulars.lib'

describe('formatAuthor', () => {
  const email = 'foo@example.com'
  const name = 'Data Soong'
  const affiliation = 'Starfleet'

  test('handles email only', () => {
    expect(formatAuthor({ email })).toBe(email)
  })

  test('handles email and name, but no affiliation', () => {
    expect(formatAuthor({ email, name })).toBe(`${name} <${email}>`)
  })

  test('handles email and affiliation, but no name', () => {
    expect(formatAuthor({ email, affiliation })).toBe(email)
  })

  test('handles email, name, and affiliation', () => {
    expect(formatAuthor({ email, name, affiliation })).toBe(
      `${name} at ${affiliation} <${email}>`
    )
  })
})
