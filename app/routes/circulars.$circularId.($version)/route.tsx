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
import { useRef, useState } from 'react'
import invariant from 'tiny-invariant'
import { useOnClickOutside } from 'usehooks-ts'

import type { loader as parentLoader } from '../circulars.$circularId/route'
import { findAdjacentCircular, get } from '../circulars/circulars.server'
import DetailsDropdownButton from '~/components/DetailsDropdownButton'
import DetailsDropdownContent from '~/components/DetailsDropdownContent'
import { ToolbarButtonGroup } from '~/components/ToolbarButtonGroup'
import { MarkdownBody, PlainTextBody } from '~/components/circularDisplay/Body'
import { FrontMatter } from '~/components/circularDisplay/FrontMatter'
import { origin } from '~/lib/env.server'
import { getCanonicalUrlHeaders, pickHeaders } from '~/lib/headers.server'
import { useSearchString } from '~/lib/utils'
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
  invariant(circularId)
  const result = await get(
    parseFloat(circularId),
    version ? parseFloat(version) : undefined
  )
  const [nextCircular, previousCircular] = await Promise.all([
    findAdjacentCircular(parseFloat(circularId), 'next'),
    findAdjacentCircular(parseFloat(circularId), 'previous'),
  ])

  return json(
    { ...result, nextCircular, previousCircular },
    {
      headers: {
        ...getCanonicalUrlHeaders(new URL(`/circulars/${circularId}`, origin)),
      },
    }
  )
}

export function shouldRevalidate() {
  return true
}

export const headers: HeadersFunction = ({ loaderHeaders }) =>
  pickHeaders(loaderHeaders, ['Link'])

export default function () {
  const {
    circularId,
    body,
    bibcode,
    version,
    format,
    nextCircular,
    previousCircular,
    ...frontMatter
  } = useLoaderData<typeof loader>()
  const searchString = useSearchString()
  const Body = format === 'text/markdown' ? MarkdownBody : PlainTextBody
  const result = useRouteLoaderData<typeof parentLoader>(
    'routes/circulars.$circularId'
  )

  const latest = version && !result?.history.includes(version)
  const linkString = `/circulars/${circularId}${
    !latest && version ? `/${version}` : ''
  }`

  return (
    <>
      <ToolbarButtonGroup className="flex-wrap">
        <Link to={`/circulars${searchString}`} className="usa-button">
          <Icon.ArrowBack role="presentation" className="margin-y-neg-2px" />
          Back
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
              title="Retrieve bibliographic record from the SAO/NASA Astrophysics Data Service (ADS)."
            >
              Cite
            </Link>
          ) : (
            <Button
              type="button"
              disabled
              outline
              title="The ADS entry for this Circular is not yet available. ADS entries are updated every week on Monday at 08:00 UTC. Please check back later."
            >
              Cite
            </Button>
          )}
        </ButtonGroup>
        <Link
          to={`/circulars/new/${circularId}`}
          className="usa-button usa-button--outline"
          title="Submit a correction to this GCN Circular."
        >
          <Icon.Edit role="presentation" className="margin-y-neg-2px" />
          Edit
        </Link>
        {result?.history && result.history.length > 0 && (
          <CircularsHistory circular={circularId} history={result?.history} />
        )}
      </ToolbarButtonGroup>
      <h1 className="margin-bottom-0">GCN Circular {circularId}</h1>
      <FrontMatter {...frontMatter} />
      <Body className="margin-y-2">{body}</Body>
      <ButtonGroup type="segmented">
        {Number.isFinite(previousCircular) ? (
          <Link
            to={`/circulars/${previousCircular}${searchString}`}
            className="usa-button"
          >
            <Icon.NavigateBefore
              role="presentation"
              className="margin-y-neg-2px"
            />
            Previous Circular
          </Link>
        ) : (
          <Button type="button" className="usa-button" disabled aria-disabled>
            <Icon.NavigateBefore
              role="presentation"
              className="margin-y-neg-2px"
            />
            Previous Circular
          </Button>
        )}
        {Number.isFinite(nextCircular) ? (
          <Link
            to={`/circulars/${nextCircular}${searchString}`}
            className="usa-button"
          >
            Next Circular
            <Icon.NavigateNext
              role="presentation"
              className="margin-y-neg-2px"
            />
          </Link>
        ) : (
          <Button type="button" className="usa-button" disabled aria-disabled>
            Next Circular
            <Icon.NavigateNext
              role="presentation"
              className="margin-y-neg-2px"
            />
          </Button>
        )}
      </ButtonGroup>
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
  const ref = useRef<HTMLDivElement>(null)
  const [showContent, setShowContent] = useState(false)
  const searchString = useSearchString()
  useOnClickOutside(ref, () => {
    setShowContent(false)
  })
  return (
    <div ref={ref}>
      <DetailsDropdownButton
        outline
        expanded={showContent}
        onClick={() => {
          setShowContent((shown) => !shown)
        }}
      >
        Versions
      </DetailsDropdownButton>
      {showContent && (
        <DetailsDropdownContent>
          <CardBody>
            <Link
              onClick={() => setShowContent(!showContent)}
              to={`/circulars/${circular}`}
            >
              Latest
            </Link>
            {history &&
              history.map((version) => (
                <div key={version}>
                  <Link
                    onClick={() => setShowContent(!showContent)}
                    to={`/circulars/${circular}/${version}${searchString}`}
                  >
                    Version {version}
                  </Link>
                </div>
              ))}
          </CardBody>
        </DetailsDropdownContent>
      )}
    </div>
  )
}
