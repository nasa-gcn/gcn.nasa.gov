/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Octokit } from '@octokit/rest'
import { type DataFunctionArgs, redirect } from '@remix-run/node'

const githubData = {
  owner: 'nasa-gcn',
  repo: 'gcn-schema',
}
const octokit = new Octokit()

export async function loader({ params: { '*': path } }: DataFunctionArgs) {
  const latestRelease = (await octokit.rest.repos.getLatestRelease(githubData))
    .data
  if (!latestRelease) throw new Response(null, { status: 404 })

  return redirect(
    `https://raw.githubusercontent.com/nasa-gcn/gcn-schema/${latestRelease.tag_name}/${path}`
  )
}
