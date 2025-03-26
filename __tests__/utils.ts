/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { joinListWithOxfordComma } from '~/lib/utils'
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
