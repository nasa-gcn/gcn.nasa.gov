/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { readFile, readdir } from 'fs/promises'
import { dirname, extname, join } from 'path'

import type {
  ReferencedSchema,
  Schema,
} from '~/components/SchemaBrowserElements'

function isErrnoException(e: unknown): e is NodeJS.ErrnoException {
  return e instanceof Error && 'code' in e && 'errno' in e
}

export async function loadJson(filePath: string): Promise<Schema> {
  if (!filePath) throw new Error('path must be defined')

  if (extname(filePath) !== '.json')
    throw new Response('not found', { status: 404 })

  const path = join(dirname(require.resolve('@nasa-gcn/schema')), filePath)

  let body: Schema
  try {
    body = JSON.parse(
      await readFile(path, {
        encoding: 'utf-8',
      })
    )

    if (body.allOf?.find((x) => x.$ref)) {
      await loadSubSchema(body.allOf)
    }
    if (body.anyOf?.find((x) => x.$ref)) {
      await loadSubSchema(body.anyOf)
    }
    if (body.oneOf?.find((x) => x.$ref)) {
      await loadSubSchema(body.oneOf)
    }
  } catch (e) {
    if (isErrnoException(e) && e.code === 'ENOENT') {
      throw new Response('Not found', { status: 404 })
    }
    throw e
  }

  return body
}

async function loadSubSchema(schemaArray: ReferencedSchema[]) {
  for (let item of schemaArray) {
    if (!item.$ref.startsWith('#')) {
      const subSchemaPath = join(
        dirname(require.resolve('@nasa-gcn/schema')),
        item.$ref.replace('schema/', '')
      )

      item.schema = JSON.parse(
        await readFile(subSchemaPath, {
          encoding: 'utf-8',
        })
      )
    }
  }
}

export type ExampleFiles = {
  name: string
  content: object
}

export async function loadSchemaExamples(
  path: string
): Promise<ExampleFiles[]> {
  const dirPath = path.substring(0, path.lastIndexOf('/') + 1)
  const schemaName = path.substring(path.lastIndexOf('/') + 1)
  const exampleFiles = (
    await readdir(join(dirname(require.resolve('@nasa-gcn/schema')), dirPath))
  ).filter(
    (x) =>
      x.startsWith(`${schemaName.split('.')[0]}.`) &&
      x.endsWith('.example.json')
  )
  let result: ExampleFiles[] = []
  exampleFiles.forEach(async (exampleFile) => {
    const example = await loadJson(join(dirPath, exampleFile))
    result.push({
      name: exampleFile.replace('.example.json', ''),
      content: example,
    })
  })
  return result
}
