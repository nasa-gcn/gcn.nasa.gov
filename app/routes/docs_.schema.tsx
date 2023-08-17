/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { DataFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Link, Outlet, useLoaderData, useParams } from '@remix-run/react'
import {
  CardBody,
  CardHeader,
  GridContainer,
  Icon,
} from '@trussworks/react-uswds'
import { useState } from 'react'

import DetailsDropdownButton from '~/components/DetailsDropdownButton'
import DetailsDropdownContent from '~/components/DetailsDropdownContent'
import { publicStaticShortTermCacheControlHeaders } from '~/lib/headers.server'
import { getVersionRefs } from '~/lib/schema-data.server'

export async function loader({
  params: { version, '*': path },
}: DataFunctionArgs) {
  if (!version) throw new Response(null, { status: 404 })
  if (path?.endsWith('/')) {
    return redirect(`${path.slice(0, -1)}`)
  }

  const versions = await getVersionRefs()

  return json(
    { versions },
    { headers: publicStaticShortTermCacheControlHeaders }
  )
}

export default function Schema() {
  const { version, '*': path } = useParams()

  const [showVersions, setShowVersions] = useState(false)
  const { versions } = useLoaderData()

  return (
    <GridContainer>
      <div className="grid-row grid-gap margin-y-2">
        <Link to="/docs">
          <div className="position-relative">
            <Icon.ArrowBack className="position-absolute top-0 left-0" />
          </div>
          <span className="padding-left-2">Back</span>
        </Link>
      </div>
      <div className="grid-row grid-gap margin-y-1">
        <div className="tablet:grid-col-3">
          <DetailsDropdownButton
            className="width-full"
            onClick={() => setShowVersions(!showVersions)}
            outline
          >
            {<>Version: {version}</>}
          </DetailsDropdownButton>
          {showVersions && (
            <DetailsDropdownContent>
              <CardHeader>
                <h3>Versions</h3>
              </CardHeader>
              <CardBody className="padding-y-0">
                {versions.map((x: { name: string; ref: string }) => (
                  <div key={x.name}>
                    <Link to={`/docs/schema/${x.ref}/${path}`}>{x.name}</Link>
                  </div>
                ))}
              </CardBody>
            </DetailsDropdownContent>
          )}
        </div>
      </div>
      <div className="grid-row grid-gap">
        <Outlet />
      </div>
    </GridContainer>
  )
}
