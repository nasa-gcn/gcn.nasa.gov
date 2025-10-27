/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { AttributeType } from '@aws-sdk/client-cognito-identity-provider'

import {
  extractAttribute,
  extractAttributeRequired,
} from '~/lib/cognito.server'

const mockUserAttributes: AttributeType[] = [
  { Name: 'sub', Value: '00000000-0000-0000-0000-000000000000' },
  { Name: 'email', Value: 'example@example.com' },
  { Name: 'name', Value: 'Example User' },
  { Name: 'custom:affiliation', Value: 'The Example Institute' },
]

describe('extractAttribute', () => {
  test('extracts name attribute', () => {
    expect(extractAttribute(mockUserAttributes, 'name')).toBe('Example User')
  })

  test('extracts affiliation attribute', () => {
    expect(extractAttribute(mockUserAttributes, 'custom:affiliation')).toBe(
      'The Example Institute'
    )
  })

  test('returns undefined if missing attribute', () => {
    expect(extractAttribute(mockUserAttributes, 'username')).toBe(undefined)
  })

  test('returns undefined if attributes array is undefined', () => {
    expect(extractAttribute(undefined, 'username')).toBe(undefined)
  })
})

describe('extractAttributeRequired', () => {
  test('extracts email attribute', () => {
    expect(extractAttributeRequired(mockUserAttributes, 'email')).toBe(
      'example@example.com'
    )
  })

  test('extracts sub attribute', () => {
    expect(extractAttributeRequired(mockUserAttributes, 'sub')).toBe(
      '00000000-0000-0000-0000-000000000000'
    )
  })

  test('throws error when attribute key is missing', () => {
    expect(() =>
      extractAttributeRequired(mockUserAttributes, 'username')
    ).toThrow(new Error('required user attribute username is missing'))
  })
})
