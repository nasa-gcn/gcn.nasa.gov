/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { DOMParser } from '@xmldom/xmldom'
import invariant from 'tiny-invariant'

import { publicStaticShortTermCacheControlHeaders } from '~/lib/headers.server'

export async function loader({ params: { '*': value } }: LoaderFunctionArgs) {
  invariant(value)

  const url = new URL('https://export.arxiv.org/api/query')
  url.searchParams.set('id_list', value)
  const response = await fetch(url)

  if (!response.ok) {
    console.error(response)
    throw new Error('arXiv request failed')
  }

  const text = await response.text()
  const entry = new DOMParser()
    .parseFromString(text, 'text/xml')
    .getElementsByTagName('entry')[0]

  // If arXiv does not find the article, then it still returns an entyr,
  // although the entry does not contain much. If the id field is missing, then
  // we report that it was not found.
  if (!entry.getElementsByTagName('id').length) {
    throw new Response(null, { status: 404 })
  }

  const title = entry.getElementsByTagName('title')[0].textContent

  const published = entry.getElementsByTagName('published')[0].textContent
  const year = published && new Date(published).getFullYear()

  const authorElements = entry.getElementsByTagName('author')
  let authors = authorElements[0].getElementsByTagName('name')[0].textContent
  if (authorElements.length > 1) authors += ' et al.'

  return json(
    { title, year, authors },
    { headers: publicStaticShortTermCacheControlHeaders }
  )
}
