/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { term } from 'lucene'
import invariant from 'tiny-invariant'

import { getEnvOrDieInProduction } from '~/lib/env.server'
import { publicStaticShortTermCacheControlHeaders } from '~/lib/headers.server'

const adsTokenTooltip = getEnvOrDieInProduction('ADS_TOKEN_TOOLTIP')

export async function loader({ params: { '*': value } }: LoaderFunctionArgs) {
  invariant(value)

  const url = new URL('https://api.adsabs.harvard.edu/v1/search/query')
  url.searchParams.set('q', `doi:"${term.escape(value)}"`)
  url.searchParams.set(
    'fl',
    'bibstem,pub,pub_raw,title,first_author,author_count,year'
  )
  url.searchParams.set('rows', '1')
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${adsTokenTooltip}` },
  })

  if (!response.ok) {
    console.error(response)
    throw new Error('ADS request failed')
  }

  const item:
    | {
        bibstem: string[]
        pub: string
        pub_raw: string
        title: string[]
        first_author: string
        author_count: number
        year: string
      }
    | undefined = (await response.json()).response.docs[0]
  if (!item) throw new Response(null, { status: 404 })

  let pub = item.pub_raw
  if (item.bibstem[0] && item.pub_raw.startsWith(item.pub))
    pub = item.bibstem[0] + item.pub_raw.substring(item.pub.length)
  pub = pub.replace(' Volume ', ' Vol. ')
  pub = pub.replace(' Issue ', ' Iss. ')

  let authors = item.first_author
  if (item.author_count > 1) authors += ' et al.'

  const year = item.year
  const title = item.title.join(' ')

  return json(
    { pub, year, authors, title },
    { headers: publicStaticShortTermCacheControlHeaders }
  )
}
