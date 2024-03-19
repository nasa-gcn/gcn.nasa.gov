/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  GetObjectAttributesCommand,
  ObjectAttributes,
} from '@aws-sdk/client-s3'
import { json } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import { ButtonGroup, Icon } from '@trussworks/react-uswds'
import prettyBytes from 'pretty-bytes'
import invariant from 'tiny-invariant'

import { Anchor } from '~/components/Anchor'
import { staticBucket as Bucket } from '~/lib/env.server'
import { publicStaticShortTermCacheControlHeaders } from '~/lib/headers.server'
import { getBucketKey } from '~/scheduled/circulars/actions/tar'
import { s3 } from '~/scheduled/circulars/storage'

async function getFileSize(format: string) {
  const Key = getBucketKey(format)
  try {
    const { ObjectSize } = await s3.send(
      new GetObjectAttributesCommand({
        Bucket,
        Key,
        ObjectAttributes: [ObjectAttributes.OBJECT_SIZE],
      })
    )
    invariant(ObjectSize !== undefined)
    return ObjectSize
  } catch (e) {
    if (
      process.env.NODE_ENV !== 'production' &&
      e instanceof Object &&
      'name' in e &&
      e.name === 'InvalidBucketName'
    ) {
      console.warn('making up fake object size')
      return 1024 * 1024 * 50
    } else {
      throw e
    }
  }
}

export async function loader() {
  const [jsonSize, txtSize] = await Promise.all(
    ['json', 'txt'].map(getFileSize)
  )
  return json(
    { json: jsonSize, txt: txtSize },
    { headers: publicStaticShortTermCacheControlHeaders }
  )
}

function DownloadLink({
  children,
  size,
  className,
  ...props
}: JSX.IntrinsicElements['a'] & { size: number }) {
  return (
    <a className="usa-button usa-button--outline" {...props}>
      {children} ({prettyBytes(size)})
    </a>
  )
}

/** Don't reevaluate this route's loader due to client-side navigations. */
export function shouldRevalidate() {
  return false
}

export default function () {
  const { txt, json } = useLoaderData<typeof loader>()

  return (
    <>
      <Outlet />
      <h2>
        <Anchor>Advanced</Anchor>
      </h2>
      <Icon.FileDownload role="presentation" /> Download all Circulars as a
      .tar.gz archive:{' '}
      <ButtonGroup type="segmented">
        <DownloadLink href="/circulars/archive.json.tar.gz" size={json}>
          JSON
        </DownloadLink>
        <DownloadLink href="/circulars/archive.txt.tar.gz" size={txt}>
          Text
        </DownloadLink>
      </ButtonGroup>
    </>
  )
}
