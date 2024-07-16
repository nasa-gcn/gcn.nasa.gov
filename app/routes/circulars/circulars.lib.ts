/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { dedent } from 'ts-dedent'

export interface CircularMetadata {
  circularId: number
  subject: string
  eventId?: string
}

export type SubmittedHow = 'web' | 'email' | 'email-legacy' | 'api'

export const circularFormats = ['text/plain', 'text/markdown'] as const
export type CircularFormat = (typeof circularFormats)[number]

export interface Circular extends CircularMetadata {
  sub?: string
  createdOn: number
  body: string
  submitter: string
  submittedHow?: SubmittedHow
  bibcode?: string
  editedBy?: string
  version?: number // 1: Original
  editedOn?: number
  format?: CircularFormat
}

export interface CircularChangeRequest extends CircularMetadata {
  body: string
  requestor: string
  requestorSub: string
  requestorEmail: string
  format: CircularFormat
  submitter: string
  createdOn: number
}

export interface CircularChangeRequestKeys {
  circularId: number
  requestorSub: string
}

type SubjectMatcher = [RegExp, (match: RegExpMatchArray) => string]

const subjectMatchers: SubjectMatcher[] = [
  [/GRB[.\s_-]*(\d{6}[a-z|.]\d*)/i, ([, id]) => `GRB ${id.toUpperCase()}`],
  [/SGR[.\s_-]*(J*\d{4}\.?\d*\+\d{4})/i, ([, id]) => `SGR ${id.toUpperCase()}`],
  [
    /SGR[.\s_-]*Swift[.\s_-]*(J*\d{4}\.?\d*\+\d{4})/i,
    ([, id]) => `SGR Swift ${id.toUpperCase()}`,
  ],
  [/IceCube[.\s_-]*(\d{6}[a-z])/i, ([, id]) => `IceCube-${id.toUpperCase()}`],
  [/ZTF[.\s_-]*(\d{2}[a-z]*)/i, ([, id]) => `ZTF${id.toLowerCase()}`],
  [/HAWC[.\s_-]*(\d{6}A)/i, ([, id]) => `HAWC-${id.toUpperCase()}`],
  [
    /((?:LIGO|Virgo|KAGRA)(?:[/-](?:LIGO|Virgo|KAGRA))*)[-_ \s]?(S|G|GW)(\d{5,}[a-z]*)/i,
    ([, instrument, flag, id]) => {
      return `${instrument} ${flag.toUpperCase()}${id.toLowerCase()}`
    },
  ],
  [/ANTARES[.\s_-]*(\d{6}[a-z])/i, ([, id]) => `ANTARES ${id}`.toUpperCase()],
  [
    /Baksan\sNeutrino\sObservatory\sAlert[.\s_-]*(\d{6}.\d{2})/i,
    ([, id]) => `Baksan Neutrino Observatory Alert ${id}`,
  ],
]

/** Format a Circular as plain text. */
export function formatCircularText({
  circularId,
  subject,
  createdOn,
  body,
  submitter,
}: Circular) {
  const d = new Date(createdOn)
  const [YY, MM, DD, hh, mm, ss] = [
    d.getUTCFullYear() % 100,
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds(),
  ].map((i) => i.toString().padStart(2, '0'))

  return dedent`
  TITLE:   GCN CIRCULAR
  NUMBER:  ${circularId}
  SUBJECT: ${subject}
  DATE:    ${YY}/${MM}/${DD} ${hh}:${mm}:${ss} GMT
  FROM:    ${submitter}

  ${body}
  `
}

/** Format a Circular as JSON. */
export function formatCircularJson({ sub, ...props }: Circular) {
  return JSON.stringify(props, null, 2)
}

/** Convert a date to an ISO 8601 string with seconds precision. */
export function formatDateISO(date: number) {
  return new Date(date).toISOString().replace(/\.\d+Z$/, 'Z')
}

/** Return true if the subject is valid, false if it is invalid, or undefined if it is an empty string */
export function subjectIsValid(subject: string) {
  if (subject.length) {
    const subjectLowerCase = subject.toLowerCase()
    return (
      !emailIsAutoReply(subject) &&
      validSubjectKeywords.some((x) =>
        subjectLowerCase.includes(x.toLowerCase())
      )
    )
  }
}

/** Return true if the body is valid, false if it is invalid, or undefined if it is an empty string */
export function bodyIsValid(body: string) {
  if (body.length) return true
}

export function formatIsValid(format: string): format is CircularFormat {
  return (circularFormats as any as string[]).includes(format)
}

export function submitterIsValid(submitter?: string) {
  return Boolean(submitter)
}

export function dateTimeIsValid(date: string) {
  return !Number.isNaN(Date.parse(date))
}

export function emailIsAutoReply(subject: string) {
  const lowercaseSubject = subject.toLowerCase()
  return emailAutoReplyChecklist.some((x) => lowercaseSubject.includes(x))
}

export const validSubjectKeywords = [
  'AGILE',
  'ALMA',
  'AMON',
  'ANTARES',
  'AXP',
  'Baksan Neutrino Observatory Alert',
  'CALET',
  'Chandra',
  'EP',
  'Fermi',
  'FXT',
  'GRANDMA',
  'GRB',
  'GW',
  'HAWC',
  'HST',
  'IBAS',
  'IceCube',
  'INTEGRAL',
  'IPN',
  'JCMT',
  'KAGRA',
  'KamLAND',
  'KONUS',
  'LIGO',
  'LOFAR',
  'LVC',
  'LVK',
  'LXT',
  'MAGIC',
  'MASTER',
  'MAXI',
  'NuEM',
  'Pan-STARRS',
  'POLAR',
  'RATIR',
  'SDSS',
  'SFXT',
  'SGR',
  'Super-Kamiokande',
  'Suzaku',
  'Swift',
  'transient',
  'VLA',
  'VLBI',
  'XRB',
  'XRF',
  'XRT',
  'XTR',
  'Virgo',
  'ZTF',
]

export const emailAutoReplyChecklist = [
  'this is an automatic reply',
  'automatic reply: ',
  'auto reply',
  'autoreply',
  'vacation',
  'out of the office',
  'out of office',
  'out of town',
  'away from my mail',
  'away from his e-mail',
  'away from her e-mail',
  'away from the office',
  'away from his office',
  'away from her office',
  'traveling until',
  'no longer receiving mail',
  'delivery failure notif',
  'mail delivery failure',
  'returned mail',
  'saxzlcnkgzmfpbhvyzsbub',
  'ponse_automatique',
  'off-line re:',
  're: ',
  'fwd: ',
  ' r: ',
  ' ris: ',
  'subject:',
]

export function formatAuthor({
  name,
  affiliation,
  email,
}: {
  name?: string
  affiliation?: string
  email: string
}) {
  if (!name) return email
  else if (!affiliation) return `${name} <${email}>`
  else return `${name} at ${affiliation} <${email}>`
}

export function parseEventFromSubject(value: string) {
  for (const [regexp, normalize] of subjectMatchers) {
    const startsWithMatch = RegExp(`^${regexp.source}`).exec(value)
    if (startsWithMatch) return normalize(startsWithMatch)
  }
  for (const [regexp, normalize] of subjectMatchers) {
    const match = regexp.exec(value)
    if (match) return normalize(match)
  }
}
