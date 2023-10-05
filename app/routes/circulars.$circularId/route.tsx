/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { DataFunctionArgs, HeadersFunction } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Button, ButtonGroup, Icon } from '@trussworks/react-uswds'
import { useState } from 'react'

import { PlainTextBody } from './Body'
import { getUser } from '../_auth/user.server'
import { get, updateEventData } from '../circulars/circulars.server'
import { Edit } from './Edit'
import { FrontMatter } from './FrontMatter'

import { feature, origin } from '~/lib/env.server'
import { getCanonicalUrlHeaders, pickHeaders } from '~/lib/headers.server'
import { getFormDataString, useSearchString } from '~/lib/utils'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle<typeof loader> = {
  breadcrumb({ data }) {
    if (data) {
      const { circularId, subject } = data
      return `${circularId}: ${subject}`
    }
  },
}

export async function loader({
  request,
  params: { circularId },
}: DataFunctionArgs) {
  if (!circularId)
    throw new Response('circularId must be defined', { status: 400 })
  const user = await getUser(request)
  const isModerator = user?.groups.includes('gcn.nasa.gov/circular-moderator')
  const result = await get(parseFloat(circularId))
  const hasSynonyms = feature('SYNONYM_GROUPING')

  return {
    hasSynonyms,
    isModerator,
    ...result, // Include the existing data
    headers: getCanonicalUrlHeaders(
      new URL(`/circulars/${circularId}`, origin)
    ),
  }
}

export async function action({ request }: DataFunctionArgs) {
  const data = await request.formData()
  const circularId = getFormDataString(data, 'circular-id')
  const eventId = getFormDataString(data, 'event-id')
  const synonyms = getFormDataString(data, 'synonyms')
  const synonymsArray = synonyms ? synonyms.split(',') : undefined
  if (!circularId) return null
  return await updateEventData({
    circularId: parseInt(circularId),
    eventId,
    synonyms: synonymsArray,
  })
}

export const headers: HeadersFunction = ({ loaderHeaders }) =>
  pickHeaders(loaderHeaders, ['Link'])

export default function () {
  const {
    circularId,
    body,
    bibcode,
    isModerator,
    hasSynonyms,
    ...frontMatter
  } = useLoaderData<typeof loader>()
  const [isEdit, setIsEdit] = useState(false)
  const searchString = useSearchString()

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
            to={`/circulars/${circularId}.txt`}
            className="usa-button usa-button--outline"
            reloadDocument
          >
            Text
          </Link>
          <Link
            to={`/circulars/${circularId}.json`}
            className="usa-button usa-button--outline"
            reloadDocument
          >
            JSON
          </Link>
        </ButtonGroup>
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
        {isModerator && hasSynonyms && (
          <Button
            className="usa-button usa-button--outline"
            type="button"
            onClick={(e) => {
              setIsEdit(!isEdit)
            }}
          >
            {isEdit ? (
              <Icon.Visibility className="margin-bottom-neg-05" />
            ) : (
              <Icon.Edit className="margin-bottom-neg-05" />
            )}
          </Button>
        )}
      </ButtonGroup>
      <h1>GCN Circular {circularId}</h1>
      <FrontMatter {...frontMatter} />
      {isEdit ? (
        <Edit {...frontMatter} circularId={circularId}></Edit>
      ) : (
        <PlainTextBody className="margin-y-2">{body}</PlainTextBody>
      )}
    </>
  )
}
