/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import '@nasa-gcn/schema'
import type { DataFunctionArgs } from '@remix-run/node'
import { readFile } from 'node:fs/promises'
import { dirname, extname, join } from 'node:path'

function isErrnoException(e: unknown): e is NodeJS.ErrnoException {
  return e instanceof Error && 'code' in e && 'errno' in e
}

/* Make all JSON files at https://github.com/nasa-gcn/gcn-schema available from
 * https://gcn.nasa.gov/schema */
export async function loader({ params: { '*': subPath } }: DataFunctionArgs) {
  if (!subPath) throw new Error('path must be defined')

  if (extname(subPath) !== '.json')
    throw new Response('not found', { status: 404 })

  const path = join(dirname(require.resolve('@nasa-gcn/schema')), subPath)

  let body
  try {
    body = await readFile(path, {
      encoding: 'utf-8',
    })
  } catch (e) {
    if (isErrnoException(e) && e.code === 'ENOENT') {
      throw new Response('Not found', { status: 404 })
    }
    throw e
  }

  return new Response(body, { headers: { 'Content-Type': 'application/json' } })
}
