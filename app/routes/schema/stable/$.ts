/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { Octokit } from '@octokit/rest'
import { type DataFunctionArgs, redirect } from '@remix-run/node'

const githubData = {
  owner: 'nasa-gcn',
  repo: 'gcn-schema',
}
const octokit = new Octokit()

export async function loader({ params: { '*': path } }: DataFunctionArgs) {
  const tags = (await octokit.rest.repos.listTags(githubData)).data.map(
    (x) => x.name
  )

  if (!tags.length) throw new Response(null, { status: 404 })

  path = `${tags[0]}/${path}`

  return redirect(
    `https://raw.githubusercontent.com/nasa-gcn/gcn-schema/${path ?? ''}`
  )
}
