/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Icon } from '@trussworks/react-uswds'
import invariant from 'tiny-invariant'

import {
  getAllSynonymMembers,
  getSynonymById,
} from './synonyms/synonyms.server'
import { ToolbarButtonGroup } from '~/components/ToolbarButtonGroup'
import { PlainTextBody } from '~/components/circularDisplay/Body'
import { FrontMatter } from '~/components/circularDisplay/FrontMatter'
import { feature } from '~/lib/env.server'

export async function loader({
  params: { synonymId },
  request: { url },
}: LoaderFunctionArgs) {
  if (!feature('SYNONYMS')) throw new Response(null, { status: 404 })
  invariant(synonymId)

  const { searchParams } = new URL(url)
  const view = searchParams.get('view') || 'group'
  const limit = searchParams.get('limit') || '20'
  const page = searchParams.get('page') || '1'
  const synonym = await getSynonymById(synonymId)
  const members = await getAllSynonymMembers(synonym.eventIds)

  return { members, eventIds: synonym.eventIds, view, limit, page }
}

export default function Group() {
  const { members, eventIds, view, limit, page } =
    useLoaderData<typeof loader>()
  const searchParams = new URLSearchParams()
  if (view) searchParams.set('view', view)
  if (view) searchParams.set('limit', limit)
  if (view) searchParams.set('page', page)
  const searchString = searchParams.toString()

  return (
    <>
      <ToolbarButtonGroup className="flex-wrap">
        <Link
          to={`/circulars?${searchString}`}
          className="usa-button flex-align-stretch"
        >
          <div className="position-relative">
            <Icon.ArrowBack
              role="presentation"
              className="position-absolute top-0 left-0"
            />
          </div>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Back
        </Link>
      </ToolbarButtonGroup>

      <h1>{`Group ${eventIds.join(', ')}`}</h1>
      {members.map((circular) => (
        <div key={circular.circularId}>
          <h2 className="margin-2">{`GCN Circular ${circular.circularId}`}</h2>
          <div className="margin-2">
            <FrontMatter
              createdOn={circular.createdOn}
              submitter={circular.submitter}
              subject={circular.subject}
              submittedHow={circular.submittedHow}
              editedBy={circular.editedBy}
              editedOn={circular.editedOn}
            />
          </div>
          <PlainTextBody className="margin-2" children={circular.body} />
          <hr />
        </div>
      ))}
    </>
  )
}
