/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { useSearchParams } from '@remix-run/react'
import { stripHtml } from 'string-strip-html'

export function stripTags(text: string) {
  return stripHtml(text).result
}

export function formatAndNoticeTypeToTopic(
  noticeFormat: string,
  noticeType: string
) {
  return noticeFormat == 'json'
    ? noticeType
    : `gcn.classic.${noticeFormat}.${noticeType}`
}

export function topicToFormatAndNoticeType(topic: string): {
  noticeFormat: string
  noticeType: string
} {
  if (topic.startsWith('gcn.notices.') || topic === 'igwn.gwalert')
    return {
      noticeFormat: 'json',
      noticeType: topic,
    }
  const splitString = topic.split('.')
  return { noticeFormat: splitString[2], noticeType: splitString[3] }
}

export function getFormDataString(formData: FormData, key: string) {
  const value = formData.get(key)
  if (typeof value === 'string') {
    return value
  } else if (value === null) {
    return undefined
  } else {
    throw new Response(`expected ${key} to be a string`, { status: 400 })
  }
}

export function getEnvBannerHeaderAndDescription(hostname: string) {
  const production_hostname = 'gcn.nasa.gov'
  let heading, description
  if (hostname === `dev.${production_hostname}`) {
    heading = 'Development'
    description = 'the internal development version'
  } else if (hostname === `test.${production_hostname}`) {
    heading = 'Testing'
    description = 'the public testing version'
  } else if (hostname === 'localhost') {
    heading = 'Local Development'
    description = 'a local development version'
  } else {
    heading = 'Non-Production'
    description = 'a non-production version'
  }

  return { heading, description }
}

/** Return the search string for the current page. */
export function useSearchString() {
  const [searchParams] = useSearchParams()
  let searchString = searchParams.toString()
  if (searchString) searchString = `?${searchString}`
  return searchString
}
