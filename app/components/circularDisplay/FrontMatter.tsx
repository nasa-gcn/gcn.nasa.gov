/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Grid, Link } from '@trussworks/react-uswds'
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
  const escapeQuery = (str: string) =>
    str.replace(/[+\-=&|><!(){}[\]^"~*?:/\\]/g, '\\$&')

  const safeSubmitter = submitter ?? ''
  const authorName = safeSubmitter.includes(' at ')
    ? safeSubmitter.split(' at ')[0]
    : safeSubmitter
  const authorEmail = safeSubmitter.match(/<([^>]+)>/)?.[1] ?? ''
  const authorSearchParams = new URLSearchParams({
    query: `submitter:"${escapeQuery(authorName)}"${
      authorEmail ? ` OR submitter:"${escapeQuery(authorEmail)}"` : ''
    }`,
  })
  const submitterUrl = `/circulars?${authorSearchParams}`
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
      <FrontMatterItem label="From">
        <Link href={submitterUrl}>{submitter}</Link>
      </FrontMatterItem>
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
