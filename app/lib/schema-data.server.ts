/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { RequestError } from '@octokit/request-error'
import { Octokit } from '@octokit/rest'
import memoizee from 'memoizee'
import { extname, join } from 'path'
import { relative } from 'path/posix'

import { getEnvOrDieInProduction } from './env.server'
import type {
  ReferencedSchema,
  Schema,
} from '~/routes/docs_.schema.$version.$/components'

const GITHUB_API_TOKEN = getEnvOrDieInProduction('GITHUB_API_TOKEN')
const octokit = new Octokit({ auth: GITHUB_API_TOKEN })
const repoData = {
  repo: 'gcn-schema',
  owner: 'nasa-gcn',
}

export const getVersionRefs = memoizee(
  async function () {
    const releases = (await octokit.rest.repos.listReleases(repoData)).data.map(
      (x) => ({ name: x.name, ref: x.tag_name })
    )
    return [...releases, { name: 'main', ref: 'main' }]
  },
  { promise: true }
)

export const loadJson = memoizee(
  async function (filePath: string, ref: string): Promise<Schema> {
    if (!filePath) throw new Error('path must be defined')

    if (extname(filePath) !== '.json')
      throw new Response('not found', { status: 404 })

    let body: Schema
    try {
      body = await loadContentFromGithub(filePath, ref)
      if (body.allOf?.find((x) => x.$ref)) {
        await loadSubSchema(body.allOf, body.$id)
      }
      if (body.anyOf?.find((x) => x.$ref)) {
        await loadSubSchema(body.anyOf, body.$id)
      }
      if (body.oneOf?.find((x) => x.$ref, body.$id)) {
        await loadSubSchema(body.oneOf, body.$id)
      }
    } catch (e) {
      throw new Response('Not found', { status: 404 })
    }

    return body
  },
  { promise: true }
)

async function loadContentFromGithub(path: string, ref?: string) {
  const ghData = (
    await octokit.repos.getContent({
      ...repoData,
      path: path.replaceAll('\\', '/'),
      ref: ref ?? 'main',
      mediaType: {
        format: 'raw',
      },
    })
  ).data

  if (!ghData || typeof ghData != 'string')
    throw new Response(null, { status: 404 })

  return JSON.parse(ghData) as Schema
}

async function loadSubSchema(
  schemaArray: ReferencedSchema[],
  parentId: string
) {
  for (const item of schemaArray) {
    if (!item.$ref.startsWith('#')) {
      const { resolvedPath, ref } = resolveRelativePath(parentId, item.$ref)
      item.schema = await loadContentFromGithub(resolvedPath, ref)
    }
  }
}

function resolveRelativePath(
  id: string,
  relativePath: string
): { resolvedPath: string; ref: string } {
  const baseUrl = new URL(id)
  const resolvedUrl = new URL(relativePath, baseUrl)
  const fullResolvedPathSegments = relative('/', resolvedUrl.pathname).split(
    '/'
  )
  const resolvedPath = fullResolvedPathSegments.slice(2).join('/')
  const ref = fullResolvedPathSegments[1]
  return { resolvedPath, ref }
}

export type ExampleFiles = {
  name: string
  content: object
}
export type GitContentDataResponse = {
  name: string
  path: string
  type: string
  content?: string
  children?: GitContentDataResponse[]
}

export const loadSchemaExamples = memoizee(
  async function (path: string, ref: string): Promise<ExampleFiles[]> {
    const dirPath = path.substring(0, path.lastIndexOf('/'))
    const schemaName = path.substring(path.lastIndexOf('/') + 1)
    const exampleFiles = (await getGithubDir(dirPath, ref)).filter(
      (x) =>
        x.name.startsWith(`${schemaName.split('.')[0]}.`) &&
        x.name.endsWith('.example.json')
    )

    const result: ExampleFiles[] = []
    for (const exampleFile of exampleFiles) {
      const exPath = join(dirPath, '/', exampleFile.name)
      const example = await loadContentFromGithub(exPath, ref)
      result.push({
        name: exampleFile.name.replace('.example.json', ''),
        content: example,
      })
    }
    return result
  },
  { promise: true }
)

export const getGithubDir = memoizee(
  async function (
    path?: string,
    ref = 'main'
  ): Promise<GitContentDataResponse[]> {
    return (
      await octokit.repos.getContent({
        ...repoData,
        path: path ?? 'gcn',
        ref,
      })
    ).data as GitContentDataResponse[]
  },
  { promise: true }
)

async function getDefaultBranch() {
  return (await octokit.rest.repos.get(repoData)).data.default_branch
}

export const getLatestRelease = memoizee(
  async function () {
    try {
      return (await octokit.rest.repos.getLatestRelease(repoData)).data.tag_name
    } catch (error) {
      if (error instanceof RequestError && error.status === 404)
        return await getDefaultBranch()
      throw error
    }
  },
  { promise: true }
)
