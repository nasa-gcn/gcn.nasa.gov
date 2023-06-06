/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { type DataFunctionArgs, redirect } from '@remix-run/node'

import { getEnvOrDieInProduction } from '~/lib/env.server'

type TagObject = {
  name: string
}

/* Make all JSON files at https://github.com/nasa-gcn/gcn-schema available from
 * https://gcn.nasa.gov/schema */
export async function loader({
  params: { '*': path },
  request: { url },
}: DataFunctionArgs) {
  const requestedTag =
    new URL(url).searchParams.get('version')?.toLowerCase() ?? 'latest'
  const GITHUB_API_TOKEN = getEnvOrDieInProduction('GITHUB_API_ACCESS')

  const tags: TagObject[] = await (
    await fetch('https://api.github.com/repos/nasa-gcn/gcn-schema/tags', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${GITHUB_API_TOKEN}`,
      },
    })
  ).json()

  let parsedTag = ''

  if (requestedTag === 'latest') {
    parsedTag = tags[0]?.name ?? 'main'
  } else if (requestedTag == 'main') {
    parsedTag = 'main'
  } else if (tags.map((x) => x.name).includes(requestedTag)) {
    parsedTag = requestedTag
  } else {
    throw new Response(null, { status: 404 })
  }

  return redirect(
    `https://raw.githubusercontent.com/nasa-gcn/gcn-schema/${parsedTag}/${
      path ?? ''
    }`
  )
}
