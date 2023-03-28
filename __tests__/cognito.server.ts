/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { AttributeType } from '@aws-sdk/client-cognito-identity-provider'

import {
  extractAttribute,
  extractAttributeRequired,
} from '~/lib/cognito.server'

const mockUserAttribues: AttributeType[] = [
  { Name: 'sub', Value: '00000000-0000-0000-0000-000000000000' },
  { Name: 'email', Value: 'example@example.com' },
  { Name: 'name', Value: 'Example User' },
  { Name: 'custom:affiliation', Value: 'The Example Institute' },
]

describe('extractAttribute', () => {
  test('extracts name attribute', () => {
    expect(extractAttribute({ Attributes: mockUserAttribues }, 'name')).toBe(
      'Example User'
    )
  })

  test('extracts affiliation attribute', () => {
    expect(
      extractAttribute({ Attributes: mockUserAttribues }, 'custom:affiliation')
    ).toBe('The Example Institute')
  })

  test('returns undefined if missing attribute', () => {
    expect(
      extractAttribute({ Attributes: mockUserAttribues }, 'username')
    ).toBe(undefined)
  })

  test('returns undefined if attributes array is undefined', () => {
    expect(extractAttribute({ Attributes: undefined }, 'username')).toBe(
      undefined
    )
  })
})

describe('extractAttributeRequired', () => {
  test('extracts email attribute', () => {
    expect(
      extractAttributeRequired({ Attributes: mockUserAttribues }, 'email')
    ).toBe('example@example.com')
  })

  test('extracts sub attribute', () => {
    expect(
      extractAttributeRequired({ Attributes: mockUserAttribues }, 'sub')
    ).toBe('00000000-0000-0000-0000-000000000000')
  })

  test('throws error when attribute key is missing', () => {
    expect(() =>
      extractAttributeRequired({ Attributes: mockUserAttribues }, 'username')
    ).toThrow(new Error('required user attribute username is missing'))
  })
})
