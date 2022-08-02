/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

export function mapFormatAndNoticeTypesToTopics(
  noticeFormat: string,
  noticeTypes: string[]
) {
  return noticeTypes.map(
    (noticeType) => `gcn.classic.${noticeFormat}.${noticeType}`
  )
}

export function mapTopicsToFormatAndNoticeTypes(topics: string[]): {
  noticeFormat: string
  noticeTypes: string[]
} {
  let formats: string[] = []
  let types: string[] = []

  for (const topic of topics) {
    const splitString = topic.split('.')
    formats.push(splitString[2])
    types.push(splitString[3])
  }
  return { noticeFormat: [...new Set(formats)][0], noticeTypes: types }
}
