/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { type LoaderFunctionArgs, json } from '@remix-run/node'
import invariant from 'tiny-invariant'

import { getEnvOrDie } from '~/lib/env.server'
import { publicStaticShortTermCacheControlHeaders } from '~/lib/headers.server'

const splitter = /[:.]/

export async function loader({ params: { '*': value } }: LoaderFunctionArgs) {
  invariant(value)

  const tnsBotName = getEnvOrDie('TNS_BOT_NAME')
  const tnsBotKey = getEnvOrDie('TNS_BOT_KEY')
  const tnsBotID = getEnvOrDie('TNS_BOT_ID')

  const url = new URL('https://www.wis-tns.org/api/get/object')
  const formData = new FormData()
  formData.set('api_key', tnsBotKey)
  formData.set('data', JSON.stringify({ objname: value }))

  const response = await fetch(url, {
    headers: {
      'User-Agent': `tns_marker${JSON.stringify({ tns_id: tnsBotID, type: 'bot', name: tnsBotName })}`,
    },
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    console.error(response)
    throw new Error('TNS request failed')
  }

  const {
    ra,
    dec,
    internal_names: names,
  }: {
    ra?: string
    dec?: string
    internal_names?: string
  } = (await response.json()).data.reply

  if (!(ra && dec && names)) throw new Response(null, { status: 404 })

  return json(
    {
      ra: ra.split(splitter),
      dec: dec.split(splitter),
      // Some TNS events have values of `internal_names` that have an orphaned
      // leading or trailing comma, such as `', PS24brk'`. Strip them out.
      names: names.split(/\s*,\s*/).filter(Boolean),
    },
    { headers: publicStaticShortTermCacheControlHeaders }
  )
}
