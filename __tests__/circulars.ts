/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import dedent from 'ts-dedent'

import {
  formatAuthor,
  formatCircular,
} from '../app/routes/circulars/circulars.lib'

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

describe('formatCircular', () => {
  test('formats a toy circular', () => {
    expect(
      formatCircular({
        circularId: 123,
        subject: 'GRB 170817A: The most amazing GRB ever',
        body: "You're never going to believe this...",
        createdOn: 1678416915088,
        submitter: 'Data Soong at Starfleet <data@starfleet.org>',
      })
    ).toBe(dedent`
      TITLE:   GCN CIRCULAR
      NUMBER:  123
      SUBJECT: GRB 170817A: The most amazing GRB ever
      DATE:    23/03/10 02:55:15 GMT
      FROM:    Data Soong at Starfleet <data@starfleet.org>

      You're never going to believe this...
    `)
  })
})
