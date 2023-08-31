/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { DataFunctionArgs } from '@remix-run/node'
import { publicStaticShortTermCacheControlHeaders } from '~/lib/headers.server'
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getEnvOrDie } from '~/lib/env.server'

export async function loader({ request }: DataFunctionArgs) {
  const client = new S3Client({})
  const Bucket = getEnvOrDie('ARC_STATIC_BUCKET')
  const command = new GetObjectCommand({
    Bucket: Bucket,
    Key: 'circulars.archive.json.tar'
  })
  
  const response = await client.send(command);
  const result = response.Body?.transformToWebStream();
  const headers = {
    ...publicStaticShortTermCacheControlHeaders,
    'Content-Type': 'application/x-tar',
  }
  return new Response(result, { headers })
}
