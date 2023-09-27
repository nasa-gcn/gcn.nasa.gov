/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Grid } from '@trussworks/react-uswds'
import type { ReactNode } from 'react'

import { type Circular, formatDateISO } from '../circulars/circulars.lib'
import TimeAgo from '~/components/TimeAgo'

const submittedHowMap = {
  web: 'Web form',
  email: 'email',
  'email-legacy': 'legacy email',
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
}: Pick<Circular, 'subject' | 'createdOn' | 'submitter' | 'submittedHow'>) {
  return (
    <>
      <FrontMatterItem label="Subject">{subject}</FrontMatterItem>
      <FrontMatterItem label="Date">
        {formatDateISO(createdOn)}{' '}
        <small className="text-base-light">
          (<TimeAgo time={createdOn}></TimeAgo>)
        </small>
      </FrontMatterItem>
      <FrontMatterItem label="From">{submitter}</FrontMatterItem>
      {submittedHow && (
        <FrontMatterItem label="Via">
          {submittedHowMap[submittedHow]}
        </FrontMatterItem>
      )}
    </>
  )
}
