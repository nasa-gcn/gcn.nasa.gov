/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { stripTags } from '~/lib/utils'

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
