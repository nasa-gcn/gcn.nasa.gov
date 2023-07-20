/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { Octokit } from '@octokit/rest'
import { extname, join } from 'path'
import { relative } from 'path/posix'

import { getEnvOrDieInProduction } from './env.server'
import type {
  ReferencedSchema,
  Schema,
} from '~/routes/docs/schema-browser/SchemaBrowserElements.lib'

const GITHUB_API_TOKEN = getEnvOrDieInProduction('GITHUB_API_TOKEN')
const octokit = new Octokit({ auth: GITHUB_API_TOKEN })
const repoData = {
  repo: 'gcn-schema',
  owner: 'nasa-gcn',
}

function isErrnoException(e: unknown): e is NodeJS.ErrnoException {
  return e instanceof Error && 'code' in e && 'errno' in e
}

export async function getVersionRefs() {
  const releases = (await octokit.rest.repos.listReleases(repoData)).data.map(
    (x) => ({ name: x.name, ref: x.tag_name })
  )
  return [...releases, { name: 'main', ref: 'main' }]
}

export async function loadJson(filePath: string, ref: string): Promise<Schema> {
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
    if (isErrnoException(e) && e.code === 'ENOENT') {
      throw new Response('Not found', { status: 404 })
    }
    throw e
  }

  return body
}

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

export async function loadSchemaExamples(
  path: string,
  ref: string
): Promise<ExampleFiles[]> {
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
    const example = await loadContentFromGithub(exPath)
    result.push({
      name: exampleFile.name.replace('.example.json', ''),
      content: example,
    })
  }
  return result
}

export async function getGithubDir(
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
}
