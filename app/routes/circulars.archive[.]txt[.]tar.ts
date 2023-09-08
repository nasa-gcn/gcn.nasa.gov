/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { redirect } from '@remix-run/node'

import { region, staticBucket } from '~/lib/env.server'
import { getBucketKey } from '~/scheduled/circulars/uploadTar'

function getBucketUrl(region: string, bucket: string, key: string) {
  return `https://s3.${region}.amazonaws.com/${bucket}/${key}`
}

export async function loader() {
  return redirect(getBucketUrl(region, staticBucket, getBucketKey('txt')))
}
