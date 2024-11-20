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
  const hawcEvent = 'HAWC-221123A'
  const iceEvent = 'IceCube-221223A'
  const lvkEvent = 'LIGO/Virgo S200224ca'
  const sgrEvent = 'SGR 1935+2154'
  const ztfEvent = 'ZTF23aabmzlp'
  const epEvent = 'EP241119a'

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

    test('handles GRB event names in misc positions', () => {
      const grbSubjectWithSpace =
        'Swift detection of a possibly short burst for GRB 230228A'
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

  describe('EP', () => {
    test('handles EP event names with space', () => {
      const epSubject = 'EP 241119a: Global MASTER-Net observations report'
      expect(parseEventFromSubject(epSubject)).toBe(epEvent)
    })

    test('handles EP event names with space in misc positions', () => {
      const epSubjectWithSpace =
        'Global MASTER-Net EP 241119a observations report'
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
})

describe('emailIsAutoReply', () => {
  const invalidFwdSubject = 'FWD: Check this out'
  test('detects valid subjectline', () => {
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
