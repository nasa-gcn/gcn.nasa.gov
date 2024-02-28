/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { HeadersFunction, LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useLoaderData, useRouteLoaderData } from '@remix-run/react'
import { Button, ButtonGroup, CardBody, Icon } from '@trussworks/react-uswds'
import { useState } from 'react'
import invariant from 'tiny-invariant'

import type { loader as parentLoader } from '../_gcn.circulars.$circularId/route'
import { get } from '../_gcn.circulars/circulars.server'
import { MarkdownBody, PlainTextBody } from './Body'
import { FrontMatter } from './FrontMatter'
import DetailsDropdownButton from '~/components/DetailsDropdownButton'
import DetailsDropdownContent from '~/components/DetailsDropdownContent'
import { feature, origin } from '~/lib/env.server'
import {
  getCanonicalUrlHeaders,
  pickHeaders,
  publicStaticZeroLifeCacheControlHeaders,
} from '~/lib/headers.server'
import { useSearchString } from '~/lib/utils'
import { useFeature } from '~/root'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle<typeof loader> = {
  breadcrumb({ data }) {
    if (data) {
      const { subject, version } = data
      return `${version ? `v${version} - ` : ''} ${subject}`
    }
  },
}

export async function loader({
  params: { circularId, version },
}: LoaderFunctionArgs) {
  if (!feature('CIRCULAR_VERSIONS') && version)
    throw new Response(null, { status: 404 })
  invariant(circularId)
  const result = await get(
    parseFloat(circularId),
    version ? parseFloat(version) : undefined
  )

  return json(result, {
    headers: {
      ...publicStaticZeroLifeCacheControlHeaders,
      ...getCanonicalUrlHeaders(new URL(`/circulars/${circularId}`, origin)),
    },
  })
}

export const headers: HeadersFunction = ({ loaderHeaders }) =>
  pickHeaders(loaderHeaders, ['Link'])

export default function () {
  const { circularId, body, bibcode, version, format, ...frontMatter } =
    useLoaderData<typeof loader>()
  const searchString = useSearchString()
  const Body =
    useFeature('CIRCULARS_MARKDOWN') && format === 'text/markdown'
      ? MarkdownBody
      : PlainTextBody

  const result = useRouteLoaderData<typeof parentLoader>(
    'routes/_gcn.circulars.$circularId'
  )

  const latest = version && !result?.history.includes(version)
  const linkString = `/circulars/${circularId}${
    !latest && version ? `/${version}` : ''
  }`
  return (
    <>
      <ButtonGroup>
        <Link to={`/circulars${searchString}`} className="usa-button">
          <div className="position-relative">
            <Icon.ArrowBack
              role="presentation"
              className="position-absolute top-0 left-0"
            />
          </div>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Back
        </Link>
        <ButtonGroup type="segmented">
          <Link
            to={`${linkString}.txt`}
            className="usa-button usa-button--outline"
            reloadDocument
          >
            Text
          </Link>
          <Link
            to={`${linkString}.json`}
            className="usa-button usa-button--outline"
            reloadDocument
          >
            JSON
          </Link>
          {bibcode ? (
            <Link
              to={`https://ui.adsabs.harvard.edu/abs/${bibcode}`}
              className="usa-button usa-button--outline"
            >
              Cite (ADS)
            </Link>
          ) : (
            <Button
              type="button"
              disabled
              outline
              title="The ADS entry for this Circular is not yet available. ADS entries are updated every week on Monday at 08:00 UTC. Please check back later."
            >
              Cite (ADS)
            </Button>
          )}
        </ButtonGroup>
        {useFeature('CIRCULAR_VERSIONS') && (
          <Link
            className="usa-button usa-button--outline"
            to={`/circulars/correction/${circularId}`}
          >
            Request Correction
          </Link>
        )}
        {useFeature('CIRCULAR_VERSIONS') &&
          result?.history &&
          result.history.length > 0 && (
            <CircularsHistory circular={circularId} history={result?.history} />
          )}
        {useFeature('CIRCULAR_VERSIONS') && result?.userIsModerator && (
          <Link
            to={`/circulars/edit/${circularId}`}
            className="usa-button usa-button--outline"
          >
            Edit
          </Link>
        )}
      </ButtonGroup>
      <h1 className="margin-bottom-0">GCN Circular {circularId}</h1>
      <FrontMatter {...frontMatter} />
      <Body className="margin-y-2">{body}</Body>
    </>
  )
}

function CircularsHistory({
  circular,
  history,
}: {
  circular: number
  history?: number[]
}) {
  const [showVersions, setShowVersions] = useState<boolean>(false)

  return (
    <>
      <DetailsDropdownButton
        outline
        onClick={() => {
          setShowVersions((shown) => !shown)
        }}
      >
        Versions
      </DetailsDropdownButton>
      {showVersions && (
        <DetailsDropdownContent>
          <CardBody>
            <Link
              onClick={() => setShowVersions(!showVersions)}
              to={`/circulars/${circular}`}
              reloadDocument
            >
              Latest
            </Link>
            {history &&
              history.map((version) => (
                <div key={version}>
                  <Link
                    onClick={() => setShowVersions(!showVersions)}
                    to={`/circulars/${circular}/${version}`}
                  >
                    Version {version}
                  </Link>
                </div>
              ))}
          </CardBody>
        </DetailsDropdownContent>
      )}
    </>
  )
}
