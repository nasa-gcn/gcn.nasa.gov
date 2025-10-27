/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { joinListWithOxfordComma, truncateJsonMaxBytes } from '~/lib/utils'
import { stripTags } from '~/lib/utils.server'

describe('stripTags', () => {
  const textBody = '<NUMPAGES>123</NUMPAGES>'
  const htmlText = 'ab <div>cd</div> ef'
  const partialTag = '<script something nefarious here'

  test('handles unique tags', () => {
    expect(stripTags(textBody)).toBe('123')
  })
  test('handles normal html tags', () => {
    expect(stripTags(htmlText)).toBe('ab cd ef')
  })
  test('handles partial html tags', () => {
    expect(stripTags(partialTag)).toBe('')
  })
})

describe('joinListWithOxfordComma', () => {
  test('works with 1 item', () => {
    expect(joinListWithOxfordComma(['foo'])).toBe('foo')
  })
  test('works with 2 items', () => {
    expect(joinListWithOxfordComma(['foo', 'bar'])).toBe('foo and bar')
  })
  test('works with 3 items', () => {
    expect(joinListWithOxfordComma(['foo', 'bar', 'bat'])).toBe(
      'foo, bar, and bat'
    )
  })
  test('works with 4 items', () => {
    expect(joinListWithOxfordComma(['foo', 'bar', 'bat', 'baz'])).toBe(
      'foo, bar, bat, and baz'
    )
  })
})

describe('truncateJsonMaxBytes', () => {
  test('handles strings with no escsaped characters', () => {
    const text = 'The quick brown fox jumped over the lazy dog.'
    expect(truncateJsonMaxBytes(text, 100)).toEqual({ text, truncated: false })
    expect(truncateJsonMaxBytes(text, 30)).toEqual({
      text: 'The quick brown fox ju',
      truncated: true,
    })
  })
  test('truncates pathological text with escape sequences', () => {
    const letters = 'a'.repeat(50)
    expect(truncateJsonMaxBytes(letters, 52)).toEqual({
      text: letters,
      truncated: false,
    })
    const backslashes = '\\'.repeat(50)
    expect(truncateJsonMaxBytes(backslashes, 52)).toEqual({
      text: '\\'.repeat(25),
      truncated: true,
    })
  })
})
