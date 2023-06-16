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

export async function loader({ params: { '*': path } }: DataFunctionArgs) {
  const GITHUB_API_TOKEN = getEnvOrDieInProduction('GITHUB_API_ACCESS')
  const tags: TagObject[] = await (
    await fetch('https://api.github.com/repos/nasa-gcn/gcn-schema/tags', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${GITHUB_API_TOKEN}`,
      },
    })
  ).json()

  path = path?.replace('stable', tags[0]?.name ?? 'main')

  return redirect(
    `https://raw.githubusercontent.com/nasa-gcn/gcn-schema/main/${path ?? ''}`
  )
}
