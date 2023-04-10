/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { AddressObject } from 'mailparser'
import addressparser from 'nodemailer/lib/addressparser'

import { getFromAddress } from '../parse'

function parseFrom(from: string): AddressObject {
  return {
    value: addressparser(from, { flatten: true }),
    html: 'example',
    text: 'example',
  }
}

describe('getFromAddress', () => {
  test('raises if the address object is undefined', () => {
    expect(() => getFromAddress(undefined)).toThrow('From address is missing')
  })

  test('raises if there are zero addresses', () => {
    expect(() =>
      getFromAddress({ value: [], html: 'example', text: 'example' })
    ).toThrow('From address is missing')
  })

  test('raises if the address is undefined', () => {
    expect(() =>
      getFromAddress({
        value: [{ name: 'example' }],
        html: 'example',
        text: 'example',
      })
    ).toThrow('From address is missing')
  })

  test('returns the address verbatim for a normal email address', () => {
    expect(getFromAddress(parseFrom('example@example.com'))).toBe(
      'example@example.com'
    )
  })

  test('returns the original address for a rewritten address', () => {
    expect(
      getFromAddress(
        parseFrom(
          '"Example <example@example.com> via gcncirc" <mailnull@capella2.gsfc.nasa.gov>'
        )
      )
    ).toBe('example@example.com')
  })
})
