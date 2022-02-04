/* Proxy requests to S3 bucket.
 *
 * This is a quick and dirty workaround because Mission Cloud Platform does not
 * allow public buckets in dev environments.
 * FIXME: This probably breaks the browser's caching.
 */

import { LoaderFunction } from 'remix'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const client = new S3Client({})

export const loader: LoaderFunction = async ({ params }) => {
  const path = params['*']
  const sandbox = process.env.ARC_SANDBOX_PATH_TO_STATIC
  if (sandbox) {
    return fetch(`http://localhost:3333/_static/${path}`)
  } else {
    const command = new GetObjectCommand({
      Bucket: process.env.ARC_STATIC_BUCKET,
      Key: path,
    })
    const url = await getSignedUrl(client, command, { expiresIn: 5 })
    return fetch(url)
  }
}
