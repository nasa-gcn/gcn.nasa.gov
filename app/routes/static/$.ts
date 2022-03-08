/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

/* Proxy requests to S3 bucket.
 *
 * This is a quick and dirty workaround because Mission Cloud Platform does not
 * allow public buckets in dev environments.
 * FIXME: This probably breaks the browser's caching.
 */

import { LoaderFunction, redirect } from 'remix'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const client = new S3Client({})

export const loader: LoaderFunction = async ({ params }) => {
  const path = params['*']
  if (process.env.ARC_SANDBOX) {
    return redirect(`/_static/${path}`, 301)
  } else {
    const command = new GetObjectCommand({
      Bucket: process.env.ARC_STATIC_BUCKET,
      Key: path,
    })
    const url = await getSignedUrl(client, command, { expiresIn: 5 })
    return fetch(url)
  }
}

// FIXME: workaround for https://github.com/remix-run/remix/issues/1828.
// Resource routes (without browser code) don't get server pruning done.
// Once fixed upstream, remove.
export const meta = () => ({})
