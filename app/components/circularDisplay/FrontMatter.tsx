/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from '@remix-run/react'
import { Grid } from '@trussworks/react-uswds'
import { slug } from 'github-slugger'
import type { ReactNode } from 'react'
import React from 'react'

import TimeAgo from '~/components/TimeAgo'
import { useSearchString } from '~/lib/utils'
import { useFeature } from '~/root'
import {
  type Circular,
  eventTypesHumanReadable,
  formatDateISO,
} from '~/routes/circulars/circulars.lib'

const submittedHowMap = {
  web: 'Web form',
  email: 'email',
  'email-legacy': 'legacy email',
  api: 'API',
}

function FrontMatterItem({
  label,
  children,
}: {
  label: ReactNode
  children: ReactNode
}) {
  return (
    <Grid row>
      <Grid desktop={{ col: 1 }}>
        <b>{label}</b>
      </Grid>
      <Grid col="fill">{children}</Grid>
    </Grid>
  )
}

export function FrontMatter({
  subject,
  createdOn,
  eventId,
  eventType,
  submitter,
  submittedHow,
  editedBy,
  editedOn,
}: Pick<
  Circular,
  | 'subject'
  | 'createdOn'
  | 'eventId'
  | 'eventType'
  | 'submitter'
  | 'submittedHow'
  | 'editedBy'
  | 'editedOn'
>) {
  const searchString = useSearchString()
  const eventTypeFeatureFlag = useFeature('eventType')
  const sortedEventTypes = eventType?.slice().sort((eventTypeA, eventTypeB) => {
    const eventTypesOrder: Record<string, number> = {
      Misc: 1,
      Retraction: 2,
    }
    const eventTypeAName =
      eventTypesHumanReadable[eventTypeA]?.singular ?? eventTypeA
    const eventTypeBName =
      eventTypesHumanReadable[eventTypeB]?.singular ?? eventTypeB

    return (
      (eventTypesOrder[eventTypeA] ?? 0) - (eventTypesOrder[eventTypeB] ?? 0) ||
      eventTypeAName.localeCompare(eventTypeBName)
    )
  })
  return (
    <>
      <FrontMatterItem label="Subject">{subject}</FrontMatterItem>
      {eventId && (
        <FrontMatterItem label="Event">
          <Link to={`/circulars/events/${slug(eventId)}${searchString}`}>
            {eventId}
          </Link>
        </FrontMatterItem>
      )}
      {eventTypeFeatureFlag && sortedEventTypes && (
        <FrontMatterItem label="Type">
          {sortedEventTypes.map((type, index) => (
            <React.Fragment key={type}>
              {index > 0 && ', '}
              <Link to={`/circulars/types/${slug(type)}`}>
                {eventTypesHumanReadable[type]?.singular ?? type}
              </Link>
            </React.Fragment>
          ))}
        </FrontMatterItem>
      )}
      <FrontMatterItem label="Date">
        {formatDateISO(createdOn)}{' '}
        <small className="text-base-light">
          (<TimeAgo time={createdOn}></TimeAgo>)
        </small>
      </FrontMatterItem>
      {editedOn && (
        <FrontMatterItem label="Edited On">
          {formatDateISO(editedOn)}{' '}
          <small className="text-base-light">
            (<TimeAgo time={editedOn}></TimeAgo>)
          </small>
        </FrontMatterItem>
      )}
      <FrontMatterItem label="From">{submitter}</FrontMatterItem>
      {editedBy && (
        <FrontMatterItem label="Edited By">{editedBy}</FrontMatterItem>
      )}
      {submittedHow && (
        <FrontMatterItem label="Via">
          {submittedHowMap[submittedHow]}
        </FrontMatterItem>
      )}
    </>
  )
}
