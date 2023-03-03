/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import dedent from 'ts-dedent'

export interface CircularMetadata {
  circularId: number
  subject: string
}

export interface Circular extends CircularMetadata {
  sub?: string
  createdOn: number
  body: string
  submitter: string
}

/** Format a Circular as plain text. */
export function formatCircular({
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

/** Return true if the subject is valid, false if it is invalid, or undefined if it is an empty string */
export function subjectIsValid(subject: string) {
  if (subject.length)
    return (
      !emailIsAutoReply(subject) &&
      validSubjectKeywords.some((x) => subject.startsWith(x))
    )
}

/** Return true if the body is valid, false if it is invalid, or undefined if it is an empty string */
export function bodyIsValid(body: string) {
  if (body.length) return true
}

export function emailIsAutoReply(subject: string) {
  const lowercaseSubject = subject.toLowerCase()
  return emailAutoReplyChecklist.some((x) => lowercaseSubject.includes(x))
}

export const validSubjectKeywords = [
  'AGILE',
  'ANTARES',
  'AXP',
  'Chandra',
  'Fermi',
  'FXT',
  'grb',
  'GRB',
  'GW',
  'HAWC',
  'HST',
  'IBAS',
  'IceCube',
  'ICECUBE',
  'INTEGRAL',
  'IPN',
  'KONUS',
  'LIGO',
  'LVC',
  'MAXI',
  'RATIR',
  'SDSS',
  'SGR',
  'Swift',
  'SWIFT',
  'Virgo',
  'VLA',
  'VLBI',
  'XRB',
  'XTR',
]

const emailAutoReplyChecklist = [
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
