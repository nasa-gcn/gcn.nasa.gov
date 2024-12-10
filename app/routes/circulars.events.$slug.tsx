/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData, useSearchParams } from '@remix-run/react'
import { Icon } from '@trussworks/react-uswds'
import invariant from 'tiny-invariant'

import type { Synonym } from './synonyms/synonyms.lib'
import {
  getAllSynonymMembers,
  getSynonymsBySlug,
} from './synonyms/synonyms.server'
import { ToolbarButtonGroup } from '~/components/ToolbarButtonGroup'
import { PlainTextBody } from '~/components/circularDisplay/Body'
import { FrontMatter } from '~/components/circularDisplay/FrontMatter'
import { feature } from '~/lib/env.server'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle = {
  breadcrumb: 'Circular Event Group',
}

export async function loader({ params: { slug } }: LoaderFunctionArgs) {
  if (!feature('SYNONYMS')) throw new Response(null, { status: 404 })
  invariant(slug)

  const synonyms = await getSynonymsBySlug(slug)
  const eventIds = synonyms.map((synonym: Synonym) => {
    return synonym.eventId
  })
  const members = await getAllSynonymMembers(eventIds)

  return { members, eventIds }
}

export default function Group() {
  const { members, eventIds } = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()
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

      <h1>{eventIds.join(', ')}</h1>
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
