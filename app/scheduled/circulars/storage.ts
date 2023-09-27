/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { S3Client } from '@aws-sdk/client-s3'

import { staticBucket } from '~/lib/env.server'
import { publicStaticShortTermCacheControlHeaders } from '~/lib/headers.server'

export const s3 = new S3Client({})
export const Prefix = 'generated/circulars'
export const putParams = {
  Bucket: staticBucket,
  CacheControl: publicStaticShortTermCacheControlHeaders['Cache-Control'],
}
