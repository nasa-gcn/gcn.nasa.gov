/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Grid } from '@trussworks/react-uswds'
import type { ReactNode } from 'react'

import TimeAgo from '~/components/TimeAgo'
import { type Circular, formatDateISO } from '~/routes/circulars/circulars.lib'

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
  submitter,
  submittedHow,
  editedBy,
  editedOn,
}: Pick<
  Circular,
  | 'subject'
  | 'createdOn'
  | 'submitter'
  | 'submittedHow'
  | 'editedBy'
  | 'editedOn'
>) {
  return (
    <>
      <FrontMatterItem label="Subject">{subject}</FrontMatterItem>
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
