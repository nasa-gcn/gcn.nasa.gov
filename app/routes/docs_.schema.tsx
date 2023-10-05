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
  Grid,
  GridContainer,
} from '@trussworks/react-uswds'
import { useState } from 'react'
import { useWindowSize } from 'usehooks-ts'

import DetailsDropdownButton from '~/components/DetailsDropdownButton'
import DetailsDropdownContent from '~/components/DetailsDropdownContent'
import { publicStaticShortTermCacheControlHeaders } from '~/lib/headers.server'
import { getVersionRefs } from '~/lib/schema-data.server'
import BreadcrumbNav from '~/routes/docs_.schema.$version.$/BreadcrumbNav'

export async function loader({
  params: { version, '*': path },
}: DataFunctionArgs) {
  if (!version) return redirect('/docs/schema/stable/gcn')
  if (!path) return redirect(`/docs/schema/${version}/gcn`)
  if (path.endsWith('/')) {
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
  if (!path) throw new Error('Path is not defined.')

  const [showVersions, setShowVersions] = useState(false)
  const { versions } = useLoaderData<typeof loader>()
  const windowSize = useWindowSize()
  const isSchema = path.endsWith('.schema.json')

  return (
    <GridContainer>
      <Grid
        row
        className="position-sticky top-0 usa-breadcrumb z-100 padding-y-0"
      >
        <BreadcrumbNav
          path={path.replace('.schema.json', '')}
          className="tablet:grid-col-fill"
          pathPrepend={`/docs/schema/${version}`}
        />
        {windowSize.width < 480 && !isSchema && (
          <h2 className="margin-y-0">{path.split('/').slice(-1)[0]}</h2>
        )}
        <div className="tablet:grid-col-auto tablet:margin-top-2">
          <DetailsDropdownButton
            className="width-full"
            onClick={() => setShowVersions(!showVersions)}
          >
            {<>Version: {version}</>}
          </DetailsDropdownButton>
          {showVersions && (
            <DetailsDropdownContent>
              <CardHeader>
                <h3>Versions</h3>
              </CardHeader>
              <CardBody className="padding-y-0">
                {versions.map(({ name, ref }) => (
                  <div key={ref}>
                    <Link
                      className="usa-link"
                      to={`/docs/schema/${ref}/${path}`}
                      onClick={() => setShowVersions(!setShowVersions)}
                    >
                      {name || ref}
                    </Link>
                  </div>
                ))}
              </CardBody>
            </DetailsDropdownContent>
          )}
        </div>
      </Grid>
      <div className="grid-row grid-gap">
        <Outlet />
      </div>
    </GridContainer>
  )
}
