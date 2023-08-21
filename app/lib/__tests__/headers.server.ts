/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { getBasicAuthHeaders } from '../headers.server'

describe('getBasicAuthHeaders', () => {
  test('forbids colons in the username', () => {
    expect(() => getBasicAuthHeaders('foo:bar', 'bat')).toThrow(
      'Usernames for basic auth must not contain colons'
    )
  })
  test('returns correct value for a test username and password', () => {
    expect(getBasicAuthHeaders('foobar', 'bat')).toStrictEqual({
      Authorization: 'Basic Zm9vYmFyOmJhdA==',
    })
  })
})
