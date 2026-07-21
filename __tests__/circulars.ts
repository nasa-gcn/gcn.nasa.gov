/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { dedent } from 'ts-dedent'

import {
  bodyIsValid,
  emailIsAutoReply,
  formatAuthor,
  formatCircularText,
  parseEventFromSubject,
  parseEventTypeFromSubject,
  subjectIsValid,
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
      formatCircularText({
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

describe('parseEventFromSubject', () => {
  const antaresEvent = 'ANTARES 200407A'
  const baksanEvent = 'Baksan Neutrino Observatory Alert 201228.36'
  const grbEvent = 'GRB 230228A'
  const grbEventLetterless = 'GRB 230228'
  const hawcEvent = 'HAWC-221123A'
  const iceEvent = 'IceCube-221223A'
  const iceCasEvent = 'IceCube-Cascade 221223A'
  const lvkEvent = 'LIGO/Virgo S200224ca'
  const sgrEvent = 'SGR 1935+2154'
  const ztfEvent = 'ZTF23aabmzlp'
  const epEvent = 'EP241119a'
  const frbEvent = 'FRB 20250206A'
  const svomEvent = 'sb25021804'
  const gwEvent = 'GW250206'
  const snEvent = 'SN 2002A'
  const snEventDoubleLetters = 'SN 2002ap'
  const xrfEvent = 'XRF 050509C'
  const xrfEventLetterless = 'XRF 050509'
  const atEvent = 'AT2023lcr'

  test('handles nonsense subject cases', () => {
    expect(parseEventFromSubject('zawxdrcftvgbhnjm')).toBe(undefined)
    expect(parseEventFromSubject('Sunday Brunch')).toBe(undefined)
    expect(parseEventFromSubject('Reminder-etc ')).toBe(undefined)
    expect(parseEventFromSubject('S231127cg')).toBe(undefined)
  })

  describe('GRB', () => {
    test('handles GRB event names', () => {
      const grbSubjectWithSpace =
        'GRB 230228A: Swift detection of a possibly short burst'
      expect(parseEventFromSubject(grbSubjectWithSpace)).toBe(grbEvent)
    })

    test('handles GRB event names with incorrect casing', () => {
      const grbSubjectWithSpace =
        'GRB 230228a: Swift detection of a possibly short burst'
      expect(parseEventFromSubject(grbSubjectWithSpace)).toBe(grbEvent)
    })

    test('handles GRB event names in misc positions', () => {
      const grbSubjectWithSpace =
        'Swift detection of a possibly short burst for GRB 230228A'
      expect(parseEventFromSubject(grbSubjectWithSpace)).toBe(grbEvent)
    })

    test('handles GRB event names with incorrect casing in misc positions', () => {
      const grbSubjectWithSpace =
        'Swift detection of a possibly short burst for GRB 230228a'
      expect(parseEventFromSubject(grbSubjectWithSpace)).toBe(grbEvent)
    })

    test('handles GRB event names without space', () => {
      const grbSubjectWithNoSpace =
        'GRB230228A: Swift detection of a possibly short burst'
      expect(parseEventFromSubject(grbSubjectWithNoSpace)).toBe(grbEvent)
    })

    test('handles GRB event names without spaces in misc positions', () => {
      const grbSubjectWithSpace =
        'Swift detection of a possibly short burst for GRB230228A'
      expect(parseEventFromSubject(grbSubjectWithSpace)).toBe(grbEvent)
    })

    test('handles GRB event name with an underscore', () => {
      const grbSubjectWithUnderscore =
        'GRB_230228A: Swift detection of a possibly short burst'
      expect(parseEventFromSubject(grbSubjectWithUnderscore)).toBe(grbEvent)
    })

    test('handles GRB event names with an underscore in misc positions', () => {
      const grbSubjectWithUnderscore =
        'Swift detection of GRB_230228A a possibly short burst'
      expect(parseEventFromSubject(grbSubjectWithUnderscore)).toBe(grbEvent)
    })

    test('handles GRB event name with a hyphen', () => {
      const grbSubjectWithHyphen =
        'GRB-230228A: Swift detection of a possibly short burst'
      expect(parseEventFromSubject(grbSubjectWithHyphen)).toBe(grbEvent)
    })

    test('handles GRB event name with a hyphen in misc positions', () => {
      const grbSubjectWithHyphen =
        'Swift GRB-230228A detection of a possibly short burst'
      expect(parseEventFromSubject(grbSubjectWithHyphen)).toBe(grbEvent)
    })

    test('handles GRB event names without a letter', () => {
      const grbSubjectWithSpace =
        'GRB 230228: Swift detection of a possibly short burst'
      expect(parseEventFromSubject(grbSubjectWithSpace)).toBe(
        grbEventLetterless
      )
    })

    test('handles GRB event names in misc positions without letter', () => {
      const grbSubjectWithSpace =
        'Swift detection of a possibly short burst for GRB 230228'
      expect(parseEventFromSubject(grbSubjectWithSpace)).toBe(
        grbEventLetterless
      )
    })

    test('handles GRB event names without space without a letter', () => {
      const grbSubjectWithNoSpace =
        'GRB230228: Swift detection of a possibly short burst'
      expect(parseEventFromSubject(grbSubjectWithNoSpace)).toBe(
        grbEventLetterless
      )
    })

    test('handles GRB event names without spaces in misc positions without a letter', () => {
      const grbSubjectWithSpace =
        'Swift detection of a possibly short burst for GRB230228'
      expect(parseEventFromSubject(grbSubjectWithSpace)).toBe(
        grbEventLetterless
      )
    })

    test('handles GRB event name with an underscore without a letter', () => {
      const grbSubjectWithUnderscore =
        'GRB_230228: Swift detection of a possibly short burst'
      expect(parseEventFromSubject(grbSubjectWithUnderscore)).toBe(
        grbEventLetterless
      )
    })

    test('handles GRB event names with an underscore in misc positions without a letter', () => {
      const grbSubjectWithUnderscore =
        'Swift detection of GRB_230228 a possibly short burst'
      expect(parseEventFromSubject(grbSubjectWithUnderscore)).toBe(
        grbEventLetterless
      )
    })

    test('handles GRB event name with a hyphen without a letter', () => {
      const grbSubjectWithHyphen =
        'GRB-230228: Swift detection of a possibly short burst'
      expect(parseEventFromSubject(grbSubjectWithHyphen)).toBe(
        grbEventLetterless
      )
    })

    test('handles GRB event name with a hyphen in misc positions without a letter', () => {
      const grbSubjectWithHyphen =
        'Swift GRB-230228 detection of a possibly short burst'
      expect(parseEventFromSubject(grbSubjectWithHyphen)).toBe(
        grbEventLetterless
      )
    })
  })

  describe('SGR', () => {
    test('handles SGR event names', () => {
      const sgrSubject = 'SGR 1935+2154: Swift-BAT refined analysis'
      expect(parseEventFromSubject(sgrSubject)).toBe(sgrEvent)
    })

    test('handles SGR event names in misc positions', () => {
      const sgrSubjectWithSpace = 'Swift-BAT refined SGR 1935+2154 analysis'
      expect(parseEventFromSubject(sgrSubjectWithSpace)).toBe(sgrEvent)
    })

    test('handles SGR event names without space', () => {
      const sgrSubjectWithNoSpace = 'SGR1935+2154: Swift-BAT refined analysis'
      expect(parseEventFromSubject(sgrSubjectWithNoSpace)).toBe(sgrEvent)
    })

    test('handles SGR event names without spaces in misc positions', () => {
      const sgrSubjectWithSpace = 'Swift-BAT SGR1935+2154 refined analysis'
      expect(parseEventFromSubject(sgrSubjectWithSpace)).toBe(sgrEvent)
    })

    test('handles SGR event name with an underscore', () => {
      const sgrSubjectWithUnderscore =
        'SGR_1935+2154: Swift-BAT refined analysis'
      expect(parseEventFromSubject(sgrSubjectWithUnderscore)).toBe(sgrEvent)
    })

    test('handles SGR event names with an underscore in misc positions', () => {
      const sgrSubjectWithUnderscore =
        'Swift-BAT refined analysis SGR_1935+2154'
      expect(parseEventFromSubject(sgrSubjectWithUnderscore)).toBe(sgrEvent)
    })

    test('handles SGR event name with a hyphen', () => {
      const sgrSubjectWithHyphen = 'SGR-1935+2154: Swift-BAT refined analysis'
      expect(parseEventFromSubject(sgrSubjectWithHyphen)).toBe(sgrEvent)
    })

    test('handles SGR event name with a hyphen in misc positions', () => {
      const sgrSubjectWithHyphen = 'Swift-BAT SGR-1935+2154 refined analysis'
      expect(parseEventFromSubject(sgrSubjectWithHyphen)).toBe(sgrEvent)
    })

    test('handles SGR event name with Swift', () => {
      const sgrSubjectWithSwift = 'SGR Swift J1234+5678 refined analysis'
      expect(parseEventFromSubject(sgrSubjectWithSwift)).toBe(
        'SGR Swift J1234+5678'
      )
    })
  })

  describe('IceCube', () => {
    test('handles IceCube event names', () => {
      const iceSubject =
        'IceCube 221223A - IceCube observation of a high-energy neutrino candidate track-like event'
      expect(parseEventFromSubject(iceSubject)).toBe(iceEvent)
    })

    test('handles IceCube event names in misc positions', () => {
      const iceSubjectWithSpace =
        'IceCube observation of IceCube 221223A a high-energy neutrino candidate track-like event'
      expect(parseEventFromSubject(iceSubjectWithSpace)).toBe(iceEvent)
    })

    test('handles IceCube event names with incorrect casing', () => {
      const iceSubject =
        'IceCube 221223a - IceCube observation of a high-energy neutrino candidate track-like event'
      expect(parseEventFromSubject(iceSubject)).toBe(iceEvent)
    })

    test('handles IceCube event names with incorrect casing in misc positions', () => {
      const iceSubjectWithSpace =
        'IceCube observation of IceCube 221223a a high-energy neutrino candidate track-like event'
      expect(parseEventFromSubject(iceSubjectWithSpace)).toBe(iceEvent)
    })

    test('handles IceCube event names without space', () => {
      const iceSubjectWithNoSpace =
        'IceCube221223A - IceCube observation of a high-energy neutrino candidate track-like event'
      expect(parseEventFromSubject(iceSubjectWithNoSpace)).toBe(iceEvent)
    })

    test('handles IceCube event names without spaces in misc positions', () => {
      const iceSubjectWithSpace =
        'IceCube observation IceCube221223A of a high-energy neutrino candidate track-like event'
      expect(parseEventFromSubject(iceSubjectWithSpace)).toBe(iceEvent)
    })

    test('handles IceCube event name with an underscore', () => {
      const iceSubjectWithUnderscore =
        'IceCube_221223A - IceCube observation of a high-energy neutrino candidate track-like event'
      expect(parseEventFromSubject(iceSubjectWithUnderscore)).toBe(iceEvent)
    })

    test('handles IceCube event names with an underscore in misc positions', () => {
      const iceSubjectWithUnderscore =
        'IceCube observation of a high-energy neutrino IceCube_221223A candidate track-like event'
      expect(parseEventFromSubject(iceSubjectWithUnderscore)).toBe(iceEvent)
    })

    test('handles IceCube event name with a hyphen', () => {
      const iceSubjectWithHyphen =
        'IceCube-221223A - IceCube observation of a high-energy neutrino candidate track-like event'
      expect(parseEventFromSubject(iceSubjectWithHyphen)).toBe(iceEvent)
    })

    test('handles IceCube event name with a hyphen in misc positions', () => {
      const iceSubjectWithHyphen =
        'IceCube observation of a high-energy IceCube-221223A neutrino candidate track-like event'
      expect(parseEventFromSubject(iceSubjectWithHyphen)).toBe(iceEvent)
    })
  })

  describe('IceCube-Cascade', () => {
    test('handles IceCube-Cascade event names', () => {
      const iceCascadeSubject =
        'IceCube-Cascade 221223A - IceCube observation of a high-energy neutrino candidate track-like event'
      expect(parseEventFromSubject(iceCascadeSubject)).toBe(iceCasEvent)
    })

    test('handles IceCube-Cascade event names in misc positions', () => {
      const iceCascadeSubjectWithSpace =
        'IceCube observation of IceCube-Cascade 221223A a high-energy neutrino candidate track-like event'
      expect(parseEventFromSubject(iceCascadeSubjectWithSpace)).toBe(
        iceCasEvent
      )
    })

    test('handles IceCube-Cascade event names with incorrect casing', () => {
      const iceCascadeSubject =
        'IceCube-Cascade 221223a - IceCube observation of a high-energy neutrino candidate track-like event'
      expect(parseEventFromSubject(iceCascadeSubject)).toBe(iceCasEvent)
    })

    test('handles IceCube-Cascade event names with incorrect casing in misc positions', () => {
      const iceCascadeSubjectWithSpace =
        'IceCube observation of IceCube-Cascade 221223a a high-energy neutrino candidate track-like event'
      expect(parseEventFromSubject(iceCascadeSubjectWithSpace)).toBe(
        iceCasEvent
      )
    })

    test('handles IceCube-Cascade event names without space', () => {
      const iceCascadeSubjectWithNoSpace =
        'IceCube-Cascade221223A - IceCube observation of a high-energy neutrino candidate track-like event'
      expect(parseEventFromSubject(iceCascadeSubjectWithNoSpace)).toBe(
        iceCasEvent
      )
    })

    test('handles IceCube-Cascade event names without spaces in misc positions', () => {
      const iceCascadeSubjectWithSpace =
        'IceCube observation IceCubeCascade221223A of a high-energy neutrino candidate track-like event'
      expect(parseEventFromSubject(iceCascadeSubjectWithSpace)).toBe(
        iceCasEvent
      )
    })

    test('handles IceCube event name with an underscore', () => {
      const iceCascadeSubjectWithUnderscore =
        'IceCube_Cascade_221223A - IceCube observation of a high-energy neutrino candidate track-like event'
      expect(parseEventFromSubject(iceCascadeSubjectWithUnderscore)).toBe(
        iceCasEvent
      )
    })

    test('handles IceCube event names with an underscore in misc positions', () => {
      const iceCascadeSubjectWithUnderscore =
        'IceCube observation of a high-energy neutrino IceCube_Cascade_221223A candidate track-like event'
      expect(parseEventFromSubject(iceCascadeSubjectWithUnderscore)).toBe(
        iceCasEvent
      )
    })

    test('handles IceCube event name with a hyphen', () => {
      const iceSubjectWithHyphen =
        'IceCube-Cascade-221223A - IceCube observation of a high-energy neutrino candidate track-like event'
      expect(parseEventFromSubject(iceSubjectWithHyphen)).toBe(iceCasEvent)
    })

    test('handles IceCube event name with a hyphen in misc positions', () => {
      const iceSubjectWithHyphen =
        'IceCube observation of a high-energy IceCube-Cascade-221223A neutrino candidate track-like event'
      expect(parseEventFromSubject(iceSubjectWithHyphen)).toBe(iceCasEvent)
    })

    test('handles IceCube event name with lower case', () => {
      const iceCasLower =
        'IceCube observation of a high-energy icecube-cascade-221223a neutrino candidate track-like event'
      expect(parseEventFromSubject(iceCasLower)).toBe(iceCasEvent)
    })
  })

  describe('EP', () => {
    test('handles EP event names with space', () => {
      const epSubject = 'EP 241119a: Global MASTER-Net observations report'
      expect(parseEventFromSubject(epSubject)).toBe(epEvent)
    })

    test('handles EP event names with incorrect casing', () => {
      const epSubject = 'ep 241119A: Global MASTER-Net observations report'
      expect(parseEventFromSubject(epSubject)).toBe(epEvent)
    })

    test('handles EP event names with space in misc positions', () => {
      const epSubjectWithSpace =
        'Global MASTER-Net EP 241119a observations report'
      expect(parseEventFromSubject(epSubjectWithSpace)).toBe(epEvent)
    })

    test('handles EP event names with incorrect casing in misc positions', () => {
      const epSubjectWithSpace =
        'Global MASTER-Net EP 241119A observations report'
      expect(parseEventFromSubject(epSubjectWithSpace)).toBe(epEvent)
    })

    test('handles EP event names without space', () => {
      const epSubjectWithNoSpace = 'EP241119a EP detection'
      expect(parseEventFromSubject(epSubjectWithNoSpace)).toBe(epEvent)
    })

    test('handles EP event names without spaces in misc positions', () => {
      const epSubjectWithSpace = 'EP detection of EP241119a GRB'
      expect(parseEventFromSubject(epSubjectWithSpace)).toBe(epEvent)
    })

    test('handles EP event name with an underscore', () => {
      const epSubjectWithUnderscore =
        'EP_241119a: Global MASTER-Net observations report'
      expect(parseEventFromSubject(epSubjectWithUnderscore)).toBe(epEvent)
    })

    test('handles EP event names with an underscore in misc positions', () => {
      const epSubjectWithUnderscore =
        'Global MASTER-Net EP_241119a observations report'
      expect(parseEventFromSubject(epSubjectWithUnderscore)).toBe(epEvent)
    })

    test('handles EP event name with a hyphen', () => {
      const epSubjectWithHyphen =
        'EP-241119a: Global MASTER-Net observations report'
      expect(parseEventFromSubject(epSubjectWithHyphen)).toBe(epEvent)
    })

    test('handles EP event name with a hyphen in misc positions', () => {
      const epSubjectWithHyphen =
        'Global MASTER-Net EP-241119a observations report'
      expect(parseEventFromSubject(epSubjectWithHyphen)).toBe(epEvent)
    })
  })

  describe('ZTF', () => {
    test('handles ZTF event names with space', () => {
      const ztfSubject =
        'ZTF 23aabmzlp/AT2023azs: Zwicky Transient Facility discovery of a fast optical transient'
      expect(parseEventFromSubject(ztfSubject)).toBe(ztfEvent)
    })

    test('handles ZTF event names with space in misc positions', () => {
      const ztfSubjectWithSpace =
        'Zwicky Transient Facility discovery of ZTF 23aabmzlp/AT2023azs a fast optical transient'
      expect(parseEventFromSubject(ztfSubjectWithSpace)).toBe(ztfEvent)
    })

    test('handles ZTF event names with space and incorrect casing', () => {
      const ztfSubject =
        'ZTF 23aabmzlp/AT2023AZS: Zwicky Transient Facility discovery of a fast optical transient'
      expect(parseEventFromSubject(ztfSubject)).toBe(ztfEvent)
    })

    test('handles ZTF event names with space and incorrect casing in misc positions', () => {
      const ztfSubjectWithSpace =
        'Zwicky Transient Facility discovery of ZTF 23aabmzlp/AT2023AZS a fast optical transient'
      expect(parseEventFromSubject(ztfSubjectWithSpace)).toBe(ztfEvent)
    })

    test('handles ZTF event names without space', () => {
      const ztfSubjectWithNoSpace =
        'ZTF23aabmzlp/AT2023azs: Zwicky Transient Facility discovery of a fast optical transient'
      expect(parseEventFromSubject(ztfSubjectWithNoSpace)).toBe(ztfEvent)
    })

    test('handles ZTF event names without spaces in misc positions', () => {
      const ztfSubjectWithSpace =
        'Zwicky Transient Facility ZTF23aabmzlp/AT2023azs discovery of a fast optical transient'
      expect(parseEventFromSubject(ztfSubjectWithSpace)).toBe(ztfEvent)
    })

    test('handles ZTF event name with an underscore', () => {
      const ztfSubjectWithUnderscore =
        'ZTF_23aabmzlp/AT2023azs: Zwicky Transient Facility discovery of a fast optical transient'
      expect(parseEventFromSubject(ztfSubjectWithUnderscore)).toBe(ztfEvent)
    })

    test('handles ZTF event names with an underscore in misc positions', () => {
      const ztfSubjectWithUnderscore =
        'Zwicky Transient Facility discovery of a ZTF_23aabmzlp/AT2023azs fast optical transient'
      expect(parseEventFromSubject(ztfSubjectWithUnderscore)).toBe(ztfEvent)
    })

    test('handles ZTF event name with a hyphen', () => {
      const ztfSubjectWithHyphen =
        'ZTF-23aabmzlp/AT2023azs: Zwicky Transient Facility discovery of a fast optical transient'
      expect(parseEventFromSubject(ztfSubjectWithHyphen)).toBe(ztfEvent)
    })

    test('handles ZTF event name with a hyphen in misc positions', () => {
      const ztfSubjectWithHyphen =
        'Zwicky Transient Facility discovery of ZTF-23aabmzlp/AT2023azs a fast optical transient'
      expect(parseEventFromSubject(ztfSubjectWithHyphen)).toBe(ztfEvent)
    })
  })

  describe('HAWC', () => {
    test('handles HAWC event names', () => {
      const hawcSubject = 'HAWC 221123A Alert from the HAWC Burst Monitor '
      expect(parseEventFromSubject(hawcSubject)).toBe(hawcEvent)
    })

    test('handles HAWC event names in misc positions', () => {
      const hawcSubjectWithSpace =
        'Alert from the HAWC Burst Monitor HAWC 221123A'
      expect(parseEventFromSubject(hawcSubjectWithSpace)).toBe(hawcEvent)
    })

    test('handles HAWC event names without space', () => {
      const hawcSubjectWithNoSpace =
        'HAWC221123A Alert from the HAWC Burst Monitor'
      expect(parseEventFromSubject(hawcSubjectWithNoSpace)).toBe(hawcEvent)
    })

    test('handles HAWC event names without spaces in misc positions', () => {
      const hawcSubjectWithSpace =
        'Alert from the HAWC221123A HAWC Burst Monitor '
      expect(parseEventFromSubject(hawcSubjectWithSpace)).toBe(hawcEvent)
    })

    test('handles HAWC event name with an underscore', () => {
      const hawcSubjectWithUnderscore =
        'HAWC_221123A Alert from the HAWC Burst Monitor '
      expect(parseEventFromSubject(hawcSubjectWithUnderscore)).toBe(hawcEvent)
    })

    test('handles HAWC event names with an underscore in misc positions', () => {
      const hawcSubjectWithUnderscore =
        'Alert from the HAWC Burst Monitor HAWC_221123A'
      expect(parseEventFromSubject(hawcSubjectWithUnderscore)).toBe(hawcEvent)
    })

    test('handles HAWC event name with a hyphen', () => {
      const hawcSubjectWithHyphen =
        'HAWC-221123A Alert from the HAWC Burst Monitor'
      expect(parseEventFromSubject(hawcSubjectWithHyphen)).toBe(hawcEvent)
    })

    test('handles HAWC event name with a hyphen in misc positions', () => {
      const hawcSubjectWithHyphen =
        'Alert from the HAWC Burst Monitor HAWC-221123A'
      expect(parseEventFromSubject(hawcSubjectWithHyphen)).toBe(hawcEvent)
    })
  })

  describe('Ligo/Virgo', () => {
    test('handles LVK event names', () => {
      const lvkSubject =
        'LIGO/Virgo S200224ca: upper limits from AGILE/MCAL observations'
      expect(parseEventFromSubject(lvkSubject)).toBe(lvkEvent)
    })

    test('handles LVK event names in misc positions', () => {
      const lvkSubjectWithSpace =
        'upper limits LIGO/Virgo S200224ca from AGILE/MCAL observations'
      expect(parseEventFromSubject(lvkSubjectWithSpace)).toBe(lvkEvent)
    })

    test('handles LVK event names without space', () => {
      const lvkSubjectWithNoSpace =
        'LIGO/VirgoS200224ca: upper limits from AGILE/MCAL observations'
      expect(parseEventFromSubject(lvkSubjectWithNoSpace)).toBe(lvkEvent)
    })

    test('handles LVK event names without spaces in misc positions', () => {
      const lvkSubjectWithSpace =
        'upper limits from LIGO/VirgoS200224ca AGILE/MCAL observations'
      expect(parseEventFromSubject(lvkSubjectWithSpace)).toBe(lvkEvent)
    })

    test('handles LVK event name with an underscore', () => {
      const lvkSubjectWithUnderscore =
        'LIGO/Virgo_S200224ca: upper limits from AGILE/MCAL observations'
      expect(parseEventFromSubject(lvkSubjectWithUnderscore)).toBe(lvkEvent)
    })

    test('handles LVK event names with an underscore in misc positions', () => {
      const lvkSubjectWithUnderscore =
        'upper limits from LIGO/Virgo_S200224ca AGILE/MCAL observations'
      expect(parseEventFromSubject(lvkSubjectWithUnderscore)).toBe(lvkEvent)
    })

    test('handles LVK event name with a hyphen', () => {
      const lvkSubjectWithHyphen =
        'LIGO/Virgo-S200224ca: upper limits from AGILE/MCAL observations'
      expect(parseEventFromSubject(lvkSubjectWithHyphen)).toBe(lvkEvent)
    })

    test('handles LVK event name with a hyphen in misc positions', () => {
      const lvkSubjectWithHyphen =
        'upper limits from AGILE/MCAL LIGO/Virgo-S200224ca observations'
      expect(parseEventFromSubject(lvkSubjectWithHyphen)).toBe(lvkEvent)
    })

    test('handles LIGO/Virgo/KAGRA alert', () => {
      const ligoVirgoKagra =
        'LIGO/Virgo/KAGRA S231127cg: Identification of a GW compact binary merger candidate'
      expect(parseEventFromSubject(ligoVirgoKagra)).toBe(
        'LIGO/Virgo/KAGRA S231127cg'
      )
    })

    test('handles LIGO/Virgo/KAGRA normalization', () => {
      const ligoVirgoKagra =
        'LIGO/VIRGO/KAGRA S231127cg: Identification of a GW compact binary merger candidate'
      expect(parseEventFromSubject(ligoVirgoKagra)).toBe(
        'LIGO/Virgo/KAGRA S231127cg'
      )
    })

    test('handles LIGO/Virgo normalization', () => {
      const ligoVirgo =
        'LIGO/VIRGO S231127cg: Identification of a GW compact binary merger candidate'
      expect(parseEventFromSubject(ligoVirgo)).toBe('LIGO/Virgo S231127cg')
    })

    test('handles ligo/virgo normalization', () => {
      const ligoVirgo =
        'ligo/virgo S231127cg: Identification of a GW compact binary merger candidate'
      expect(parseEventFromSubject(ligoVirgo)).toBe('LIGO/Virgo S231127cg')
    })

    test('handles ligo/virgo flag normalization', () => {
      const ligoVirgo =
        'ligo/virgo s231127cg: Identification of a GW compact binary merger candidate'
      expect(parseEventFromSubject(ligoVirgo)).toBe('LIGO/Virgo S231127cg')
    })

    test('handles ligo/virgo id normalization', () => {
      const ligoVirgo =
        'ligo/virgo S231127CG: Identification of a GW compact binary merger candidate'
      expect(parseEventFromSubject(ligoVirgo)).toBe('LIGO/Virgo S231127cg')
    })

    test('handles LIGO/Virgo instrument odd casing', () => {
      const ligoVirgo =
        'LiGo/viRgo s231127Cg: Identification of a GW compact binary merger candidate'
      expect(parseEventFromSubject(ligoVirgo)).toBe('LIGO/Virgo S231127cg')
    })

    test('handles Ligo/Virgo instrument odd casing', () => {
      const ligoVirgo =
        'Ligo/Virgo S231127cg: Identification of a GW compact binary merger candidate'
      expect(parseEventFromSubject(ligoVirgo)).toBe('LIGO/Virgo S231127cg')
    })

    test('handles Ligo/Virgo flag casing', () => {
      const ligoVirgo =
        'LIGO/Virgo s231127cg: Identification of a GW compact binary merger candidate'
      expect(parseEventFromSubject(ligoVirgo)).toBe('LIGO/Virgo S231127cg')
    })

    test('handles Ligo/Virgo id casing', () => {
      const ligoVirgo =
        'LIGO/Virgo S231127CG: Identification of a GW compact binary merger candidate'
      expect(parseEventFromSubject(ligoVirgo)).toBe('LIGO/Virgo S231127cg')
    })

    test('handles ligo/VIRGO id casing', () => {
      const ligoVirgo =
        'ligo/VIRGO S231127CG: Identification of a GW compact binary merger candidate'
      expect(parseEventFromSubject(ligoVirgo)).toBe('LIGO/Virgo S231127cg')
    })

    test('handles ligo/VIRGO/kAgRa odd kagra casing', () => {
      const ligoVirgo =
        'ligo/VIRGo/kAgRa S231127cg: Identification of a GW compact binary merger candidate'
      expect(parseEventFromSubject(ligoVirgo)).toBe(
        'LIGO/Virgo/KAGRA S231127cg'
      )
    })

    test('handles LIGO odd casing', () => {
      const ligo =
        'lIgO S231127cg: Identification of a GW compact binary merger candidate'
      expect(parseEventFromSubject(ligo)).toBe('LIGO S231127cg')
    })

    test('handles KAGRA odd casing', () => {
      const ligo =
        'kAgRa S231127cg: Identification of a GW compact binary merger candidate'
      expect(parseEventFromSubject(ligo)).toBe('KAGRA S231127cg')
    })

    test('handles full ligo/virgo/kagra inconsistent casing', () => {
      const ligo =
        'LiGo/ViRGo/kAgRa s231127cG: Identification of a GW compact binary merger candidate'
      expect(parseEventFromSubject(ligo)).toBe('LIGO/Virgo/KAGRA S231127cg')
    })

    test('handles LIGO alert', () => {
      const ligoVirgoKagra =
        'LIGO S231127cg: Identification of a GW compact binary merger candidate'
      expect(parseEventFromSubject(ligoVirgoKagra)).toBe('LIGO S231127cg')
    })

    test('handles LIGO/Virgo alert', () => {
      const ligoVirgoKagra =
        'LIGO/Virgo S231127cg: Identification of a GW compact binary merger candidate'
      expect(parseEventFromSubject(ligoVirgoKagra)).toBe('LIGO/Virgo S231127cg')
    })

    test('handles LIGO/KAGRA alert', () => {
      const ligoVirgoKagra =
        'LIGO/KAGRA S231127cg: Identification of a GW compact binary merger candidate'
      expect(parseEventFromSubject(ligoVirgoKagra)).toBe('LIGO/KAGRA S231127cg')
    })

    test('handles LVK event name with six digits and a flag', () => {
      const lvkSubjectWithSixDigits =
        'LIGO/Virgo G211117: Further Swift-XRT sources'
      expect(parseEventFromSubject(lvkSubjectWithSixDigits)).toBe(
        'LIGO/Virgo G211117'
      )
    })

    test('handles LVK event name with GW flag', () => {
      const lvkSubjectWithGwFlag =
        'LIGO/Virgo GW170817: Chandra X-ray brightening of the counterpart 108 days since merger'
      expect(parseEventFromSubject(lvkSubjectWithGwFlag)).toBe(
        'LIGO/Virgo GW170817'
      )
    })

    test('handles LVK event name with S flag and one letter', () => {
      const lvkSubjectWithGwFlag =
        'LIGO/Virgo/KAGRA S230521k: Zwicky Transient Facility observations'
      expect(parseEventFromSubject(lvkSubjectWithGwFlag)).toBe(
        'LIGO/Virgo/KAGRA S230521k'
      )
    })
  })

  describe('ANTARES', () => {
    test('handles ANTARES event names', () => {
      const antSubject = 'Fermi-LAT-ANTARES 200407a Coincidence'
      expect(parseEventFromSubject(antSubject)).toBe(antaresEvent)
    })

    test('handles ANTARES event names in misc positions', () => {
      const antSubjectWithSpace = 'Coincidence Fermi-LAT-ANTARES 200407a'
      expect(parseEventFromSubject(antSubjectWithSpace)).toBe(antaresEvent)
    })

    test('handles ANTARES event names with incorrect casing', () => {
      const antSubject = 'Fermi-LAT-ANTARES 200407A Coincidence'
      expect(parseEventFromSubject(antSubject)).toBe(antaresEvent)
    })

    test('handles ANTARES event names with incorrect casing in misc positions', () => {
      const antSubjectWithSpace = 'Coincidence Fermi-LAT-ANTARES 200407A'
      expect(parseEventFromSubject(antSubjectWithSpace)).toBe(antaresEvent)
    })

    test('handles ANTARES event names without space', () => {
      const antSubjectWithNoSpace = 'Fermi-LAT-ANTARES200407a Coincidence'
      expect(parseEventFromSubject(antSubjectWithNoSpace)).toBe(antaresEvent)
    })

    test('handles ANTARES event names without spaces in misc positions', () => {
      const antSubjectWithSpace = 'Coincidence Fermi-LAT-ANTARES200407a'
      expect(parseEventFromSubject(antSubjectWithSpace)).toBe(antaresEvent)
    })

    test('handles ANTARES event name with an underscore', () => {
      const antSubjectWithUnderscore = 'Fermi-LAT-ANTARES_200407a Coincidence'
      expect(parseEventFromSubject(antSubjectWithUnderscore)).toBe(antaresEvent)
    })

    test('handles ANTARES event names with an underscore in misc positions', () => {
      const antSubjectWithUnderscore = 'Coincidence Fermi-LAT-ANTARES_200407a'
      expect(parseEventFromSubject(antSubjectWithUnderscore)).toBe(antaresEvent)
    })

    test('handles ANTARES event name with a hyphen', () => {
      const antSubjectWithHyphen = 'Fermi-LAT-ANTARES-200407a Coincidence'
      expect(parseEventFromSubject(antSubjectWithHyphen)).toBe(antaresEvent)
    })

    test('handles ANTARES event name with a hyphen in misc positions', () => {
      const antSubjectWithHyphen = 'Coincidence Fermi-LAT-ANTARES-200407a'
      expect(parseEventFromSubject(antSubjectWithHyphen)).toBe(antaresEvent)
    })
  })

  describe('Baksan', () => {
    test('handles Baksan event names', () => {
      const baksanSubject =
        'Baksan Neutrino Observatory Alert 201228.36: Global MASTER-Net observations report'
      expect(parseEventFromSubject(baksanSubject)).toBe(baksanEvent)
    })

    test('handles Baksan event names in misc positions', () => {
      const baksanSubjectWithSpace =
        'Global MASTER-Net Baksan Neutrino Observatory Alert 201228.36 observations report'
      expect(parseEventFromSubject(baksanSubjectWithSpace)).toBe(baksanEvent)
    })

    test('handles Baksan event names without space', () => {
      const baksanSubjectWithNoSpace =
        'Baksan Neutrino Observatory Alert201228.36: Global MASTER-Net observations report'
      expect(parseEventFromSubject(baksanSubjectWithNoSpace)).toBe(baksanEvent)
    })

    test('handles Baksan event names without spaces in misc positions', () => {
      const baksanSubjectWithSpace =
        'Global MASTER-Net observations Baksan Neutrino Observatory Alert201228.36 report'
      expect(parseEventFromSubject(baksanSubjectWithSpace)).toBe(baksanEvent)
    })

    test('handles Baksan event name with an underscore', () => {
      const baksanSubjectWithUnderscore =
        'Baksan Neutrino Observatory Alert_201228.36: Global MASTER-Net observations report'
      expect(parseEventFromSubject(baksanSubjectWithUnderscore)).toBe(
        baksanEvent
      )
    })

    test('handles Baksan event names with an underscore in misc positions', () => {
      const baksanSubjectWithUnderscore =
        'Global MASTER-Net observations report Baksan Neutrino Observatory Alert_201228.36'
      expect(parseEventFromSubject(baksanSubjectWithUnderscore)).toBe(
        baksanEvent
      )
    })

    test('handles Baksan event name with a hyphen', () => {
      const baksanSubjectWithHyphen =
        'Baksan Neutrino Observatory Alert-201228.36: Global MASTER-Net observations report'
      expect(parseEventFromSubject(baksanSubjectWithHyphen)).toBe(baksanEvent)
    })

    test('handles Baksan event name with a hyphen in misc positions', () => {
      const baksanSubjectWithHyphen =
        'Global Baksan Neutrino Observatory Alert-201228.36 MASTER-Net observations report'
      expect(parseEventFromSubject(baksanSubjectWithHyphen)).toBe(baksanEvent)
    })
  })

  describe('FRB', () => {
    test('handles FRB event names', () => {
      const frbSubject =
        'FRB 20250206A: MASTER observations and possible mother galaxy'
      expect(parseEventFromSubject(frbSubject)).toBe(frbEvent)
    })

    test('handles FRB event names with incorrect casing', () => {
      const frbSubject =
        'frb 20250206a: MASTER observations and possible mother galaxy'
      expect(parseEventFromSubject(frbSubject)).toBe(frbEvent)
    })

    test('handles outdated FRB event naming convention without letter', () => {
      const frbSubject =
        'frb 250206: MASTER observations and possible mother galaxy'
      expect(parseEventFromSubject(frbSubject)).toBe('FRB 250206')
    })

    test('handles outdated FRB event naming convention with letter', () => {
      const frbSubject =
        'frb 250206a: MASTER observations and possible mother galaxy'
      expect(parseEventFromSubject(frbSubject)).toBe('FRB 250206A')
    })

    test('handles FRB event names in misc positions', () => {
      const frbSubjectWithSpace =
        'MASTER observations:FRB 20250206A and possible mother galaxy'
      expect(parseEventFromSubject(frbSubjectWithSpace)).toBe(frbEvent)
    })

    test('handles FRB event names without space', () => {
      const frbSubjectWithNoSpace =
        'FRB20250206A: MASTER observations and possible mother galaxy'
      expect(parseEventFromSubject(frbSubjectWithNoSpace)).toBe(frbEvent)
    })

    test('handles FRB event names without spaces in misc positions', () => {
      const frbSubjectWithSpace =
        'MASTER observations: FRB20250206A and possible mother galaxy'
      expect(parseEventFromSubject(frbSubjectWithSpace)).toBe(frbEvent)
    })

    test('handles FRB event name with an underscore', () => {
      const frbSubjectWithUnderscore =
        'FRB_20250206A: MASTER observations and possible mother galaxy'
      expect(parseEventFromSubject(frbSubjectWithUnderscore)).toBe(frbEvent)
    })

    test('handles FRB event names with an underscore in misc positions', () => {
      const frbSubjectWithUnderscore =
        'MASTER observations and FRB_20250206A: possible mother galaxy'
      expect(parseEventFromSubject(frbSubjectWithUnderscore)).toBe(frbEvent)
    })

    test('handles FRB event name with a hyphen', () => {
      const frbSubjectWithHyphen =
        'FRB-20250206A: MASTER observations and possible mother galaxy'
      expect(parseEventFromSubject(frbSubjectWithHyphen)).toBe(frbEvent)
    })

    test('handles FRB event name with a hyphen in misc positions', () => {
      const frbSubjectWithHyphen =
        'MASTER observations: FRB-20250206A and possible mother galaxy'
      expect(parseEventFromSubject(frbSubjectWithHyphen)).toBe(frbEvent)
    })
  })

  describe('SVOM', () => {
    test('handles SVOM event names', () => {
      const svomSubject =
        'SVOM/sb25021804: SVOM detection of a long X-ray transient'
      expect(parseEventFromSubject(svomSubject)).toBe(svomEvent)
    })

    test('handles SVOM event names in misc positions', () => {
      const svomSubjectWithNoSpace =
        'SVOM detection: SVOM/sb25021804 a long X-ray transient'
      expect(parseEventFromSubject(svomSubjectWithNoSpace)).toBe(svomEvent)
    })

    test('handles SVOM event names with space', () => {
      const svomSubjectWithSpace =
        'SVOM/sb 25021804: SVOM detection of a long X-ray transient'
      expect(parseEventFromSubject(svomSubjectWithSpace)).toBe(svomEvent)
    })

    test('handles SVOM event names with spaces in misc positions', () => {
      const svomSubjectWithSpace =
        'SVOM detection: SVOM/sb25021804 a long X-ray transient'
      expect(parseEventFromSubject(svomSubjectWithSpace)).toBe(svomEvent)
    })

    test('handles SVOM event name with an underscore', () => {
      const svomSubjectWithUnderscore =
        'SVOM/sb_25021804: SVOM detection of a long X-ray transient'
      expect(parseEventFromSubject(svomSubjectWithUnderscore)).toBe(svomEvent)
    })

    test('handles SVOM event names with an underscore in misc positions', () => {
      const svomSubjectWithUnderscore =
        'SVOM detection: SVOM/sb25021804 a long X-ray transient'
      expect(parseEventFromSubject(svomSubjectWithUnderscore)).toBe(svomEvent)
    })

    test('handles SVOM event name with a hyphen', () => {
      const svomSubjectWithHyphen =
        'SVOM/sb-25021804: SVOM detection of a long X-ray transient'
      expect(parseEventFromSubject(svomSubjectWithHyphen)).toBe(svomEvent)
    })

    test('handles SVOM event name with a hyphen in misc positions', () => {
      const svomSubjectWithHyphen =
        'SVOM detection: SVOM/sb-25021804 a long X-ray transient'
      expect(parseEventFromSubject(svomSubjectWithHyphen)).toBe(svomEvent)
    })
  })

  describe('GW', () => {
    test('handles GW event names', () => {
      const gwSubject = 'GW250206: Swift UVOT follow-up'
      expect(parseEventFromSubject(gwSubject)).toBe(gwEvent)
    })

    test('handles GW event names with incorrect casing', () => {
      const gwSubject = 'gw250206: Swift UVOT follow-up'
      expect(parseEventFromSubject(gwSubject)).toBe(gwEvent)
    })

    test('handles GW event names in misc positions', () => {
      const gwSubjectWithSpace = 'Swift UVOT:GW250206 follow-up'
      expect(parseEventFromSubject(gwSubjectWithSpace)).toBe(gwEvent)
    })

    test('handles GW event names without space', () => {
      const gwSubjectWithNoSpace = 'GW250206: Swift UVOT follow-up'
      expect(parseEventFromSubject(gwSubjectWithNoSpace)).toBe(gwEvent)
    })

    test('handles GW event names without spaces in misc positions', () => {
      const gwSubjectWithSpace = 'Swift UVOT: GW250206 follow-up'
      expect(parseEventFromSubject(gwSubjectWithSpace)).toBe(gwEvent)
    })

    test('handles GW event name with an underscore', () => {
      const gwSubjectWithUnderscore = 'GW_250206: Swift UVOT follow-up'
      expect(parseEventFromSubject(gwSubjectWithUnderscore)).toBe(gwEvent)
    })

    test('handles GW event names with an underscore in misc positions', () => {
      const gwSubjectWithUnderscore = 'Swift UVOT GW_250206: follow-up'
      expect(parseEventFromSubject(gwSubjectWithUnderscore)).toBe(gwEvent)
    })

    test('handles GW event name with a hyphen', () => {
      const gwSubjectWithHyphen = 'GW-250206: Swift UVOT follow-up'
      expect(parseEventFromSubject(gwSubjectWithHyphen)).toBe(gwEvent)
    })

    test('handles GW event name with a hyphen in misc positions', () => {
      const gwSubjectWithHyphen = 'Swift UVOT: GW-250206 follow-up'
      expect(parseEventFromSubject(gwSubjectWithHyphen)).toBe(gwEvent)
    })
  })

  describe('SN', () => {
    test('handles first 26 SN event names', () => {
      const snSubject = 'SN 2002A (SN/GRB?) optical spectrographic observations'
      expect(parseEventFromSubject(snSubject)).toBe(snEvent)
    })

    test('handles double letter SN event names', () => {
      const snSubject =
        'SN 2002ap (SN/GRB?) optical spectrographic observations'
      expect(parseEventFromSubject(snSubject)).toBe(snEventDoubleLetters)
    })

    test('handles triple letter SN event names', () => {
      const snSubject =
        'SN 2002abc (SN/GRB?) optical spectrographic observations'
      expect(parseEventFromSubject(snSubject)).toBe('SN 2002abc')
    })

    test('handles 5 letter SN event names', () => {
      const snSubject =
        'SN 2002abcde (SN/GRB?) optical spectrographic observations'
      expect(parseEventFromSubject(snSubject)).toBe('SN 2002abcde')
    })

    test('handles SN event names with incorrect casing with two letters', () => {
      const snSubject = 'sn2002AP (SN/GRB?) optical spectrographic observations'
      expect(parseEventFromSubject(snSubject)).toBe(snEventDoubleLetters)
    })

    test('handles SN event names with incorrect casing with many letters', () => {
      const snSubject =
        'sn 2002abcde (SN/GRB?) optical spectrographic observations'
      expect(parseEventFromSubject(snSubject)).toBe('SN 2002abcde')
    })

    test('handles SN event names with incorrect casing with one letter', () => {
      const snSubject = 'sn2002a (SN/GRB?) optical spectrographic observations'
      expect(parseEventFromSubject(snSubject)).toBe(snEvent)
    })

    test('handles SN event names in misc positions', () => {
      const snSubjectWithSpace =
        '(SN/GRB?): SN 2002A  optical spectrographic observations'
      expect(parseEventFromSubject(snSubjectWithSpace)).toBe(snEvent)
    })

    test('handles SN event names with space', () => {
      const snSubjectWithNoSpace =
        'SN 2002A (SN/GRB?) optical spectrographic observations'
      expect(parseEventFromSubject(snSubjectWithNoSpace)).toBe(snEvent)
    })

    test('handles SN event names with double letters and spaces in misc positions', () => {
      const snSubjectWithSpace =
        '(SN/GRB?): SN 2002ap  optical spectrographic observations'
      expect(parseEventFromSubject(snSubjectWithSpace)).toBe(
        snEventDoubleLetters
      )
    })

    test('handles SN event name with an underscore', () => {
      const snSubjectWithUnderscore =
        'SN_2002ap (SN/GRB?) optical spectrographic observations'
      expect(parseEventFromSubject(snSubjectWithUnderscore)).toBe(
        snEventDoubleLetters
      )
    })

    test('handles SN event names with an underscore in misc positions', () => {
      const snSubjectWithUnderscore =
        '(SN/GRB?): SN_2002A optical spectrographic observations'
      expect(parseEventFromSubject(snSubjectWithUnderscore)).toBe(snEvent)
    })

    test('handles SN event names with an underscore and double letters in misc positions', () => {
      const snSubjectWithUnderscore =
        '(SN/GRB?): SN_2002ap optical spectrographic observations'
      expect(parseEventFromSubject(snSubjectWithUnderscore)).toBe(
        snEventDoubleLetters
      )
    })

    test('handles SN event name with a hyphen', () => {
      const snSubjectWithHyphen =
        'SN-2002ap (SN/GRB?) optical spectrographic observations'
      expect(parseEventFromSubject(snSubjectWithHyphen)).toBe(
        snEventDoubleLetters
      )
    })

    test('handles SN event name with a hyphen in misc positions', () => {
      const snSubjectWithHyphen =
        '(SN/GRB?): SN-2002A optical spectrographic observations'
      expect(parseEventFromSubject(snSubjectWithHyphen)).toBe(snEvent)
    })

    test('handles SN event name with a hyphen and double letters in misc positions', () => {
      const snSubjectWithHyphen =
        '(SN/GRB?): SN-2002ap optical spectrographic observations'
      expect(parseEventFromSubject(snSubjectWithHyphen)).toBe(
        snEventDoubleLetters
      )
    })
  })

  describe('XRF', () => {
    test('handles XRF event names', () => {
      const xrfSubjectWithSpace = 'XRF 050509C: Chandra Afterglow Detection'
      expect(parseEventFromSubject(xrfSubjectWithSpace)).toBe(xrfEvent)
    })

    test('handles XRF event names in misc positions', () => {
      const xrfSubjectWithSpace =
        'Chandra Afterglow Detection XRF 050509C follow up'
      expect(parseEventFromSubject(xrfSubjectWithSpace)).toBe(xrfEvent)
    })

    test('handles XRF event names with incorrect casing', () => {
      const xrfSubjectWithSpace = 'XRF 050509c: Chandra Afterglow Detection'
      expect(parseEventFromSubject(xrfSubjectWithSpace)).toBe(xrfEvent)
    })

    test('handles XRF event names with incorrect casing in misc positions', () => {
      const xrfSubjectWithSpace =
        'Chandra Afterglow Detection XRF 050509c follow up'
      expect(parseEventFromSubject(xrfSubjectWithSpace)).toBe(xrfEvent)
    })

    test('handles XRF event names without space', () => {
      const xrfSubjectWithNoSpace = 'XRF050509C: Chandra Afterglow Detection'
      expect(parseEventFromSubject(xrfSubjectWithNoSpace)).toBe(xrfEvent)
    })

    test('handles XRF event names without spaces in misc positions', () => {
      const xrfSubjectWithSpace = 'Chandra Afterglow Detection XRF050509C'
      expect(parseEventFromSubject(xrfSubjectWithSpace)).toBe(xrfEvent)
    })

    test('handles XRF event name with an underscore', () => {
      const xrfSubjectWithUnderscore =
        'XRF_050509C: Chandra Afterglow Detection'
      expect(parseEventFromSubject(xrfSubjectWithUnderscore)).toBe(xrfEvent)
    })

    test('handles XRF event names with an underscore in misc positions', () => {
      const xrfSubjectWithUnderscore =
        'Chandra Afterglow Detection XRF_050509C follow up'
      expect(parseEventFromSubject(xrfSubjectWithUnderscore)).toBe(xrfEvent)
    })

    test('handles XRF event name with a hyphen', () => {
      const xrfSubjectWithHyphen = 'XRF-050509C: Chandra Afterglow Detection'
      expect(parseEventFromSubject(xrfSubjectWithHyphen)).toBe(xrfEvent)
    })

    test('handles XRF event name with a hyphen in misc positions', () => {
      const xrfSubjectWithHyphen =
        'Chandra Afterglow Detection XRF-050509C follow-up'
      expect(parseEventFromSubject(xrfSubjectWithHyphen)).toBe(xrfEvent)
    })

    test('handles XRF event names without a letter', () => {
      const xrfSubjectWithSpace = 'XRF 050509: Chandra Afterglow Detection'
      expect(parseEventFromSubject(xrfSubjectWithSpace)).toBe(
        xrfEventLetterless
      )
    })

    test('handles XRF event names in misc positions without letter', () => {
      const xrfSubjectWithSpace =
        'Chandra Afterglow Detection XRF 050509 follow-up'
      expect(parseEventFromSubject(xrfSubjectWithSpace)).toBe(
        xrfEventLetterless
      )
    })

    test('handles XRF event names without space without a letter', () => {
      const xrfSubjectWithNoSpace = 'XRF050509: Chandra Afterglow Detection'
      expect(parseEventFromSubject(xrfSubjectWithNoSpace)).toBe(
        xrfEventLetterless
      )
    })

    test('handles XRF event names without spaces in misc positions without a letter', () => {
      const xrfSubjectWithSpace =
        'Chandra Afterglow Detection XRF050509 follow-up'
      expect(parseEventFromSubject(xrfSubjectWithSpace)).toBe(
        xrfEventLetterless
      )
    })

    test('handles XRF event name with an underscore without a letter', () => {
      const xrfSubjectWithUnderscore = 'XRF_050509: Chandra Afterglow Detection'
      expect(parseEventFromSubject(xrfSubjectWithUnderscore)).toBe(
        xrfEventLetterless
      )
    })

    test('handles XRF event names with an underscore in misc positions without a letter', () => {
      const xrfSubjectWithUnderscore =
        'Chandra Afterglow Detection XRF_050509 follow-up'
      expect(parseEventFromSubject(xrfSubjectWithUnderscore)).toBe(
        xrfEventLetterless
      )
    })

    test('handles XRF event name with a hyphen without a letter', () => {
      const xrfSubjectWithHyphen = 'XRF-050509: Chandra Afterglow Detection'
      expect(parseEventFromSubject(xrfSubjectWithHyphen)).toBe(
        xrfEventLetterless
      )
    })

    test('handles XRF event name with a hyphen in misc positions without a letter', () => {
      const xrfSubjectWithHyphen =
        'Chandra Afterglow Detection XRF-050509 follow-up'
      expect(parseEventFromSubject(xrfSubjectWithHyphen)).toBe(
        xrfEventLetterless
      )
    })
  })

  describe('AT', () => {
    test('handles AT event names', () => {
      const atSubject = 'AT 2023lcr: VLA radio detection'
      expect(parseEventFromSubject(atSubject)).toBe(atEvent)
    })

    test('handles AT event names with two letters', () => {
      const atSubject = 'AT 2023lc: VLA radio detection'
      expect(parseEventFromSubject(atSubject)).toBe('AT2023lc')
    })

    test('handles AT event names with five letters', () => {
      const atSubject = 'AT 2023lcrsjq: VLA radio detection'
      expect(parseEventFromSubject(atSubject)).toBe('AT2023lcrsjq')
    })

    test('handles AT event names with two letters and incorrect casing', () => {
      const atSubject = 'AT 2023LC: VLA radio detection'
      expect(parseEventFromSubject(atSubject)).toBe('AT2023lc')
    })

    test('handles AT event names with five letters and incorrect casing', () => {
      const atSubject = 'AT 2023LCRSJQ: VLA radio detection'
      expect(parseEventFromSubject(atSubject)).toBe('AT2023lcrsjq')
    })

    test('handles AT event names with incorrect casing', () => {
      const atSubject = 'at 2023LCR: VLA radio detection'
      expect(parseEventFromSubject(atSubject)).toBe(atEvent)
    })

    test('handles AT event names in misc positions', () => {
      const atSubjectWithSpace = 'VLA radio detection AT 2023lcr follow-up'
      expect(parseEventFromSubject(atSubjectWithSpace)).toBe(atEvent)
    })

    test('handles AT event names with spaces in misc positions', () => {
      const atSubjectWithSpace = 'VLA radio detection AT 2023lcr follow-up'
      expect(parseEventFromSubject(atSubjectWithSpace)).toBe(atEvent)
    })

    test('handles AT event name with an underscore', () => {
      const atSubjectWithUnderscore = 'AT_2023lcr: VLA radio detection'
      expect(parseEventFromSubject(atSubjectWithUnderscore)).toBe(atEvent)
    })

    test('handles AT event names with an underscore in misc positions', () => {
      const atSubjectWithUnderscore = 'VLA radio detection AT_2023lcr follow-up'
      expect(parseEventFromSubject(atSubjectWithUnderscore)).toBe(atEvent)
    })

    test('handles AT event name with a hyphen', () => {
      const atSubjectWithHyphen = 'AT-2023lcr: VLA radio detection'
      expect(parseEventFromSubject(atSubjectWithHyphen)).toBe(atEvent)
    })

    test('handles AT event name with a hyphen in misc positions', () => {
      const atSubjectWithHyphen = 'VLA radio detection AT-2023lcr follow-up'
      expect(parseEventFromSubject(atSubjectWithHyphen)).toBe(atEvent)
    })
  })
})

describe('emailIsAutoReply', () => {
  const invalidFwdSubject = 'FWD: Check this out'
  test('detects valid subject line', () => {
    expect(emailIsAutoReply(invalidFwdSubject)).toBe(true)
  })
})

describe('bodyIsValid', () => {
  test('returns undefined on empty body', () => {
    expect(bodyIsValid('')).toBe(undefined)
  })
  test('returns true on valid body', () => {
    expect(bodyIsValid('This is a valid body')).toBe(true)
  })
})

describe('subjectIsValid', () => {
  test('returns nothing when subject is empty', () => {
    expect(subjectIsValid('')).toBeUndefined()
  })
  test('returns true on valid subject', () => {
    expect(subjectIsValid('GRB ABC000123')).toBe(true)
  })
})

// Tests the event type tagging with eventTypeMatchers and parseEventTypeFromSubject
describe('parseEventTypeFromSubject', () => {
  const cases = [
    {
      name: 'Retraction pattern: \\bRetractions?\\b',
      subject: 'GRB 220311A: MASTER OT retraction',
      expected: ['Retraction', 'GRB', 'Optical Transient'],
    },
    {
      name: 'Retraction pattern: \\bnot\\s+a\\s+(?:GRB|GW|FRB|SN|SGR|neutrino)\\b',
      subject: 'Swift Trigger 931484 is not a GRB',
      expected: ['Retraction', 'GRB', 'Gamma-ray Transient'],
    },
    {
      name: 'Retraction pattern: \\bprobably\\s+not\\s+a\\b',
      subject: 'BAT GRB 060204C is probably not a GRB',
      expected: ['Retraction', 'GRB'],
    },
    {
      name: 'Retraction pattern: \\bis\\s+not\\b',
      subject:
        'Fermi Gamma-ray Burst Monitor trigger 757464861/250101954 is not a GRB',
      expected: ['Retraction', 'GRB', 'Gamma-ray Transient'],
    },
    {
      name: 'Retraction pattern: \\bDisregard\\b',
      subject: 'Disregard the Swift-XRT Notices today',
      expected: ['Retraction', 'X-ray Transient'],
    },
    {
      name: 'Retraction pattern: \\bIgnore\\b',
      subject: 'Ignore GCN/Swift-BAT Lightcurve Notices for trigger 353567',
      expected: ['Retraction', 'Gamma-ray Transient'],
    },
    {
      name: 'Retraction pattern: \\bFalse Trigger\\b',
      subject: 'Swift Trigger 287421: False trigger due to star tracker loss',
      expected: ['Retraction', 'Gamma-ray Transient'],
    },
    {
      name: 'Retraction pattern: \\bNot real\\b',
      subject:
        'The EP-WXT triggers 01709047257 and 01709047278 are not real sources',
      expected: ['Retraction', 'X-ray Transient'],
    },
    {
      name: 'GRB pattern: \\bGRB\\d{6}[A-Z]?\\b',
      subject: 'IPN localization of GRB000801',
      expected: ['GRB'],
    },
    {
      name: 'GRB pattern: \\bGRBs?\\b',
      subject: 'GRB 100213B: Enhanced Swift-XRT position',
      expected: ['GRB', 'X-ray Transient'],
    },
    {
      name: 'GRB pattern: \\bgamma[-\\s]?ray[-\\s]?bursts?\\b',
      subject: 'GRB 171230A CALET Gamma-Ray Burst Monitor detection',
      expected: ['GRB', 'Gamma-ray Transient'],
    },
    {
      name: 'GRB pattern: \\bXRF\\d{6}[A-Z]?\\b',
      subject: 'XRF040812: possible afterglow second Chandra observation',
      expected: ['GRB', 'X-ray Transient', 'Afterglow'],
    },
    {
      name: 'Gamma-ray Transient pattern: \\bFermi(?:\\s?(?:GBM|LAT)|\\d{9})?\\b',
      subject: 'Fermi-LAT Gamma-ray Observations of IceCube-260315A',
      expected: ['Gamma-ray Transient', 'Neutrino'],
    },
    {
      name: 'Gamma-ray Transient pattern: \\bSwift[:?/-]BAT\\b',
      subject:
        'LIGO/Virgo S190930t: Swift J221951-484240 optical photometry of Chilescope observatory',
      expected: ['Gamma-ray Transient', 'GW', 'Optical Transient'],
    },
    {
      name: 'Gamma-ray Transient pattern: \\bINTEGRAL\\b',
      subject: 'INTEGRAL observations of the events in the GWTC-1 catalog',
      expected: ['Gamma-ray Transient', 'GW'],
    },
    {
      name: 'Gamma-ray Transient pattern: \\bHETE\\b',
      subject: 'HETE trigger H4044: RTT150 optical observations',
      expected: ['Gamma-ray Transient', 'Optical Transient'],
    },
    {
      name: 'Gamma-ray Transient pattern: \\bKONUS\\b',
      subject:
        'A giant outburst from Cygnus X-1 detected by Konus-Wind and Suzaku-WAM',
      expected: ['Gamma-ray Transient'],
    },
    {
      name: 'Gamma-ray Transient pattern: \\bAstroSat\\b',
      subject: 'LIGO/Virgo G211117: Astrosat CZTI upper limits',
      expected: ['Gamma-ray Transient', 'GW'],
    },
    {
      name: 'Gamma-ray Transient pattern: \\b^HAWC(-\\d{6}[A-Za-z])?:?$\\b',
      subject: 'Alert from the HAWC Burst Monitor HAWC-191019A',
      expected: ['Gamma-ray Transient'],
    },
    {
      name: 'GW pattern: \\bGW\\d+\\b',
      subject:
        'LIGO/Virgo GW170817: Further Hubble Space Telescope observations',
      expected: ['GW', 'Optical Transient', 'Kilonova'],
    },
    {
      name: 'GW pattern: \\bGWs?\\b',
      subject:
        'LIGO/Virgo S191129u: Identification of a GW compact binary merger candidate',
      expected: ['GW'],
    },
    {
      name: 'GW pattern: \\bgravitational[-\\s]?waves?\\b',
      subject:
        'LIGO/Virgo G298936: Updated localization from gravitational-wave data',
      expected: ['GW'],
    },
    {
      name: 'GW pattern: \\bLIGO\\b',
      subject:
        'LIGO/Virgo G184098: ongoing Pan-STARRS search for optical transients',
      expected: ['GW', 'Optical Transient'],
    },
    {
      name: 'GW pattern: \\bVirgo\\b',
      subject:
        'LIGO/Virgo S191213g : SAO 1-m optical observation of AT2019wxt (PS19hgw)',
      expected: ['GW', 'Optical Transient'],
    },
    {
      name: 'GW pattern: \\bKAGRA\\b',
      subject:
        'LIGO/Virgo/KAGRA S250206dm: continued in SOAR galaxy targeted observations and identification of one possible transient',
      expected: ['GW'],
    },
    {
      name: 'GW pattern: \\bS\\d{6}[a-z]+\\b',
      subject: 'LIGO/Virgo S200208q: Not observable by CALET',
      expected: ['Gamma-ray Transient', 'GW'],
    },
    {
      name: 'SGR pattern: \\bSGR\\S*',
      subject:
        'ICSP VLF observation of the signatures of SGR/AXP 1E1547.0-5408 bursts',
      expected: ['SGR'],
    },
    {
      name: 'SGR pattern: \\bsoft[-\\s]?gamma[-\\s]?repeaters?\\b',
      subject: 'New Soft Gamma Repeater 0501+4516 was GRB 080822',
      expected: ['GRB', 'SGR'],
    },
    {
      name: 'FRB pattern: \\bFRB\\s?\\d{6,8}[A-Za-z]?\\b',
      subject:
        'FRB 20250206A: Nondetection of Repeating Bursts from FRB 20250206A with FAST',
      expected: ['FRB'],
    },
    {
      name: 'FRB pattern: \\bFRBs?\\b',
      subject: 'FRB 181228: Global MASTER Net  optical inspection',
      expected: ['FRB', 'Optical Transient'],
    },
    {
      name: 'FRB pattern: \\bfast[-\\s]?radio[-\\s]?bursts?\\b',
      subject:
        'FRB 180725A: MASTER optical observations of the Fast Radio Burst error box',
      expected: ['FRB', 'Optical Transient'],
    },
    {
      name: 'FRB pattern: \\bCHIME\\b',
      subject:
        'Geocentric time correction for Insight-HXMT detection of the x-ray counterpart of the FRB by CHIME and STARE2 from SGR 1935+2154',
      expected: ['Gamma-ray Transient', 'SGR', 'FRB', 'X-ray Transient'],
    },
    {
      name: 'FRB pattern: \\bDSA-110\\b',
      subject: 'Hypothetical DSA-110 Circular',
      expected: ['FRB'],
    },
    {
      name: 'SN pattern: \\bSN\\d{4}[A-Za-z]*\\b',
      subject: 'SN2002ap (SN/GRB?) Echelle spectra',
      expected: ['GRB', 'SN'],
    },
    {
      name: 'SN pattern: \\bSNe?\\b',
      subject: 'Type Ib/c SN2002ap (SN/GRB?)',
      expected: ['GRB', 'SN'],
    },
    {
      name: 'Nova pattern: \\b(?<!super)nova(ae)?\\b',
      subject:
        'Nova AT2026oyp (ASASSN-26dt): Pre-outburst Swift UVOT observation',
      expected: ['Nova', 'Optical Transient'],
    },
    {
      name: 'Neutrino pattern: \\bneutrinos?\\b',
      subject:
        'LIGO/Virgo S190923y: No neutrino candidates at Pierre Auger Observatory',
      expected: ['GW', 'Neutrino'],
    },
    {
      name: 'Neutrino pattern: \\bIceCube(?:-HAWC|-\\d+)?\\b',
      subject: 'IceCube-240327B: GRANDMA observations of 4FGL J0555.9+0030',
      expected: ['Neutrino'],
    },
    {
      name: 'Neutrino pattern: \\bANTARES\\b',
      subject:
        'Fermi-LAT-ANTARES 220121a: upper limits from a search for coincident neutrinos with IceCube',
      expected: ['Gamma-ray Transient', 'Neutrino'],
    },
    {
      name: 'Neutrino pattern: \\bKM3NeT\\b',
      subject:
        'LIGO/Virgo S200114f: Constraints on a CCSN origin from KM3NeT MeV neutrino search.',
      expected: ['GW', 'Neutrino'],
    },
    {
      name: 'Neutrino pattern: \\bSuper-Kamiokande\\b',
      subject: 'Super-Kamiokande: Neutrino search for SN2023ixf',
      expected: ['SN', 'Neutrino'],
    },
    {
      name: 'Neutrino pattern: \\bSNEWS2\\b',
      subject: 'Hypothetical SNEWS2 Circular',
      expected: ['Neutrino'],
    },
    {
      name: 'X-ray Transient pattern: (?<!\\S)EP(?=\\s|:|$)',
      subject:
        'FRB 20250316A: Kinder optical upper limits of the Einstein Probe candidate X-ray source  EP J120944.2+585060 ',
      expected: ['FRB', 'X-ray Transient'],
    },
    {
      name: 'X-ray Transient pattern: \\bEPW?[-\\s]?\\d{6,8}[A-Z]{0,2}\\b',
      subject:
        'EP250404a / GRB 250404A: Montarrenti Observatory optical observations ',
      expected: ['GRB', 'X-ray Transient', 'Optical Transient'],
    },
    {
      name: 'X-ray Transient pattern: \\bEP-WXT\\b',
      subject: 'The EP-WXT trigger 01709247525 is not a real source',
      expected: ['Retraction', 'X-ray Transient'],
    },
    {
      name: 'X-ray Transient pattern: \\bEP-FXT\\b',
      subject:
        'EP240413a: possible detection of the X-ray emission with EP-FXT after 14 hours',
      expected: ['X-ray Transient'],
    },
    {
      name: 'X-ray Transient pattern: \\bX[-\\s]?ray(?:\\s+transient)?\\b',
      subject:
        'GRB 231129C: PROMPT optical upper limits for the MAXI/GSC X-ray counterpart and the MASTER afterglow candidate ',
      expected: ['GRB', 'X-ray Transient', 'Afterglow', 'Optical Transient'],
    },
    {
      name: 'X-ray Transient pattern: \\bEinstein\\s+Probe\\b',
      subject: 'EP251118a: Einstein Probe detected of a fast X-ray transient',
      expected: ['X-ray Transient'],
    },
    {
      name: 'X-ray Transient pattern: \\bMAXI\\s?J\\d{4}[+\\-]\\d+',
      subject: 'GRB 251023B / MAXI J0451+122: MAXI/GSC detection',
      expected: ['GRB', 'X-ray Transient'],
    },
    {
      name: 'X-ray Transient pattern: \\bXRT\\b',
      subject: 'GRB 160912A: Swift-XRT refined Analysis',
      expected: ['GRB', 'X-ray Transient'],
    },
    {
      name: 'X-ray Transient pattern: \\bXRF\\b',
      subject: 'Early OT detection of XRF in NGC 2770 in Asiago frames',
      expected: ['X-ray Transient', 'Optical Transient'],
    },
    {
      name: 'X-ray Transient pattern: \\bChandra\\b',
      subject: 'EP250304a: Chandra detection',
      expected: ['X-ray Transient'],
    },
    {
      name: 'X-ray Transient pattern: \\bXMM\\b',
      subject: 'XMM-Newton observation of EP240426a',
      expected: ['X-ray Transient'],
    },
    {
      name: 'X-ray Transient pattern: \\bNICER\\b',
      subject: 'GRB 221009A: NICER follow-up observations',
      expected: ['GRB', 'X-ray Transient'],
    },
    {
      name: 'X-ray Transient pattern: \\bNuSTAR\\b',
      subject: 'GRB 221009A: NuSTAR follow-up observations',
      expected: ['GRB', 'X-ray Transient'],
    },
    {
      name: 'X-ray Transient pattern: \\bSwift[:?/-]XRT\\b',
      subject: 'Enhanced Swift-XRT position of SGR 0501+4516',
      expected: ['SGR', 'X-ray Transient'],
    },
    {
      name: 'Afterglow pattern: \\bafterglows?\\b',
      subject: 'GRB 041006 Optical afterglow observations',
      expected: ['GRB', 'Afterglow', 'Optical Transient'],
    },
    {
      name: 'Optical Transient pattern: \\boptical\\b',
      subject: 'GRB 131014A: RATIR Optical/NIR Afterglow Confirmation',
      expected: ['GRB', 'Afterglow', 'Optical Transient'],
    },
    {
      name: 'Optical Transient pattern: \\bAT\\d{4}[a-z]+\\b',
      subject:
        'LIGO/Virgo S190814bv: Further Pan-STARRS z-band observations and AT2019npv photometry',
      expected: ['GW', 'Optical Transient'],
    },
    {
      name: 'Optical Transient pattern: \\bZTF(?:\\d{2}[A-Za-z0-9]+)?\\b',
      subject: 'ZTF22aaajecp/AT2022cmc: ATCA detection',
      expected: ['Optical Transient'],
    },
    {
      name: 'Optical Transient pattern: \\bPan-STARRS\\b',
      subject: 'EP251124a: Pan-STARRS ri-band imaging and photometry',
      expected: ['X-ray Transient', 'Optical Transient'],
    },
    {
      name: 'Optical Transient pattern: \\bMASTER\\b',
      subject: 'GRB 181202A: Global MASTER-Net optical observations',
      expected: ['GRB', 'Optical Transient'],
    },
    {
      name: 'Optical Transient pattern: \\bRubin\\b',
      subject:
        'LIGO/Virgo/KAGRA S251112cm: Candidates from the NSF-DOE Vera C. Rubin Observatory',
      expected: ['GW', 'Optical Transient'],
    },
    {
      name: 'Optical Transient pattern: \\bSVOM\\/VT\\b',
      subject: 'GRB 260509A: SVOM/VT optical observations',
      expected: ['GRB', 'Optical Transient'],
    },
    {
      name: 'Optical Transient pattern: \\bSVOM\\/C-GFT\\b',
      subject: 'GRB 260511B SVOM/C-GFT optical counterpart detection',
      expected: ['GRB', 'Optical Transient'],
    },
    {
      name: 'Optical Transient pattern: \\bSwift[:?/-]UVOT\\b',
      subject: 'EP250610A: Swift/UVOT Upper limits',
      expected: ['X-ray Transient', 'Optical Transient'],
    },
    {
      name: 'Kilonova pattern:  /\\bkilonova(?:e|s)?(?!\\s*[-\\w])\\b/i',
      subject: 'GRB 230307A: good match with kilonova models',
      expected: ['GRB', 'Kilonova'],
    },
    {
      name: 'Kilonova pattern: \\bKN\b',
      subject:
        'LIGO/Virgo/KAGRA S250818k: MASTER predicovery limits of the AT2025ulz/ZTF25abjmnps KN candidate',
      expected: ['GW', 'Optical Transient', 'Kilonova'],
    },
    {
      name: 'Kilonova pattern: \\bAT2017gfo\\b',
      subject:
        'LIGO/Virgo G298048 GRAWITA: VST-ESO PARANAL follow up of AT2017gfo',
      expected: ['GW', 'Optical Transient', 'Kilonova'],
    },

    {
      name: 'Misc pattern',
      subject: 'This is a test subject for a miscellaneous event type',
      expected: ['Misc'],
    },
  ]

  test.each(cases)('%s', ({ subject, expected }) => {
    expect(parseEventTypeFromSubject(subject)).toStrictEqual(expected)
  })
})
