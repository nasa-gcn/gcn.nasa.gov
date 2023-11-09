/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { ListObjectsV2Command } from '@aws-sdk/client-s3'

import { staticBucket as Bucket, origin } from '~/lib/env.server'
import { sitemapIndex } from '~/lib/sitemap.server'
import { Prefix } from '~/scheduled/circulars/actions/sitemap'
import { s3 } from '~/scheduled/circulars/storage'

async function getCircularsSitemapEntries() {
  const response = await s3.send(new ListObjectsV2Command({ Bucket, Prefix }))
  return (
    response.Contents?.map(({ Key }) => ({
      url: `${origin}/_static/${Key}`,
    })) ?? []
  )
}

export async function loader() {
  return sitemapIndex(
    [
      { url: `${origin}/sitemap.xml` },
      { url: `${origin}/circulars.atom` },
      ...(await getCircularsSitemapEntries()),
    ],
    {
      headers: {
        'Cache-Control': `public, max-age=${60 * 5}`,
      },
    }
  )
}
