/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

export function subjectIsValid(subject: string) {
  return validSubjectKeywords.some((x) => subject.startsWith(x))
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
