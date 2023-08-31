/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { DataFunctionArgs, HeadersFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useFetcher, useLoaderData, useParams } from '@remix-run/react'
import type { ModalRef } from '@trussworks/react-uswds'
import {
  Button,
  ButtonGroup,
  Grid,
  Icon,
  Modal,
  ModalFooter,
  ModalHeading,
  ModalToggleButton,
  TextInput,
  Textarea,
} from '@trussworks/react-uswds'
import { useRef } from 'react'

import { getUser } from '../_auth/user.server'
import { PlainTextBody } from '../circulars.$circularId.($version)/PlainTextBody'
import { CircularRevisionWarning } from '../circulars.edit.($circularId)'
import type { Circular } from '../circulars/circulars.lib'
import { formatDateISO } from '../circulars/circulars.lib'
import {
  get,
  getCircularHistory,
  moderatorGroup,
} from '../circulars/circulars.server'
import TimeAgo from '~/components/TimeAgo'
import { origin } from '~/lib/env.server'
import { getCanonicalUrlHeaders, pickHeaders } from '~/lib/headers.server'
import { useSearchString } from '~/lib/utils'
import { useFeature } from '~/root'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle<typeof loader> = {
  breadcrumb({ data }) {
    if (data) {
      return `${data.latest.circularId}: ${data.latest.subject}`
    }
  },
}

export async function loader({
  request,
  params: { circularId, version },
}: DataFunctionArgs) {
  if (!circularId)
    throw new Response('circularId must be defined', { status: 400 })
  const user = await getUser(request)
  const latest = await get(parseFloat(circularId))
  // Check the version provided exists compared to the latest
  if (version && parseFloat(version) > (latest.version ?? 1))
    throw new Response(null, { status: 404 })
  const isModUser = user?.groups.includes(moderatorGroup)

  const history = await getCircularHistory(parseFloat(circularId))
  return json(
    { latest, history, user, isModUser },
    {
      headers: getCanonicalUrlHeaders(
        new URL(`/circulars/${circularId}/${version}`, origin)
      ),
    }
  )
}

export const headers: HeadersFunction = ({ loaderHeaders }) =>
  pickHeaders(loaderHeaders, ['Link'])

const submittedHowMap = {
  web: 'Web form',
  email: 'email',
  'email-legacy': 'legacy email',
}

export default function () {
  const { latest, history, user, isModUser } = useLoaderData<typeof loader>()
  const { circularId, version } = useParams()
  if (!circularId) throw new Error('Circular not found.')

  const searchString = useSearchString()
  const fetcher = useFetcher()

  const displayedVersion = version
    ? history.find((x) => x.version == parseFloat(version))
    : latest

  const showModButtons = displayedVersion == latest

  if (!displayedVersion) throw new Error('Circular not found.')
  const ref = useRef<ModalRef>(null)

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
          {/* TODO: Allow non-mods to request specific changes
            Can't save, their changes go to a queue for review
          */}
          {/* TODO: Makes sure versioned txt and JSON links work */}
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
        {displayedVersion.bibcode ? (
          <Link
            to={`https://ui.adsabs.harvard.edu/abs/${displayedVersion.bibcode}`}
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
        {useFeature('CIRCULAR_VERSIONS') && (
          <>
            {isModUser && showModButtons && (
              <Link
                className="usa-button usa-button--outline"
                to={`/circulars/edit/${latest.circularId}`}
              >
                Edit
              </Link>
            )}
            {showModButtons && (
              <ModalToggleButton
                opener
                modalRef={ref}
                type="button"
                outline
                disabled={user == undefined}
              >
                Request Changes
              </ModalToggleButton>
            )}
            {history.length > 0 && (
              <Link
                className="usa-button usa-button--outline"
                to={`/circulars/${circularId}/history`}
              >
                View Changes
              </Link>
            )}
          </>
        )}
      </ButtonGroup>
      <h1>
        GCN Circular {circularId}
        {useFeature('CIRCULAR_VERSIONS') && history.length > 0 && (
          <small> (Edited)</small>
        )}
      </h1>
      {useFeature('CIRCULAR_VERSIONS') && history.length > 0 && (
        <div className="margin-bottom-3">
          <h3 className="margin-y-0">Revision History</h3>
          <div>
            <Link to={`/circulars/${circularId}`}>
              Version {history.length + 1} (latest)
            </Link>{' '}
            Edited by {latest.editedBy} <TimeAgo time={latest.createdOn} />
          </div>
          {history.map((x) => (
            <div key={x.createdOn}>
              <Link to={`/circulars/${latest.circularId}/${x.version}`}>
                Version {x.version}
              </Link>{' '}
              {x.editedBy ? `Edited by ${x.editedBy}` : 'Posted '}{' '}
              <TimeAgo time={x.createdOn} />
            </div>
          ))}
        </div>
      )}
      <CircularContent {...displayedVersion} />
      <Modal
        id="modal-edit-request"
        aria-labelledby="modal-edit-request-heading"
        aria-describedby="modal-edit-request-description"
        isInitiallyOpen={false}
        ref={ref}
        renderToPortal={false}
        isLarge
      >
        <fetcher.Form method="POST" action="/circulars">
          <input type="hidden" name="intent" value="requested-edit" />
          <input type="hidden" name="circularId" value={circularId} />
          <ModalHeading id="modal-edit-request-heading">
            Request Circular Edits
          </ModalHeading>
          <div>
            <CircularRevisionWarning />
            <label htmlFor="body">Subject</label>
            <TextInput
              autoFocus
              aria-describedby="subjectDescription"
              className="maxw-full"
              name="subject"
              id="subject"
              type="text"
              defaultValue={displayedVersion.subject}
              required={true}
            />
            <label htmlFor="body">Body</label>
            <Textarea
              name="body"
              id="body"
              aria-describedby="bodyDescription"
              defaultValue={displayedVersion.body}
              required={true}
              className="maxw-full"
            />
          </div>
          <ModalFooter>
            <ModalToggleButton modalRef={ref} closer outline>
              Cancel
            </ModalToggleButton>
            <Button data-close-modal type="submit" disabled={user == undefined}>
              Submit
            </Button>
          </ModalFooter>
        </fetcher.Form>
      </Modal>
    </>
  )
}

function CircularContent(circular: Circular) {
  return (
    <>
      <Grid row>
        <Grid tablet={{ col: 2 }}>
          <b>Subject</b>
        </Grid>
        <Grid col="fill">{circular.subject}</Grid>
      </Grid>
      <Grid row>
        <Grid tablet={{ col: 2 }}>
          <b>Date</b>
        </Grid>
        <Grid col="fill">
          {formatDateISO(circular.createdOn)}{' '}
          <small className="text-base-light">
            (<TimeAgo time={circular.createdOn}></TimeAgo>)
          </small>
        </Grid>
      </Grid>
      <Grid row>
        <Grid tablet={{ col: 2 }}>
          <b>From</b>
        </Grid>
        <Grid col="fill">{circular.submitter}</Grid>
      </Grid>
      {useFeature('CIRCULAR_VERSIONS') && circular.editedBy && (
        <Grid row>
          <Grid tablet={{ col: 2 }}>
            <b>Editor</b>
          </Grid>
          <Grid col="fill">{circular.editedBy}</Grid>
        </Grid>
      )}
      {circular.submittedHow && (
        <Grid row>
          <Grid tablet={{ col: 2 }}>
            <b>Submitted By</b>
          </Grid>
          <Grid col="fill">{submittedHowMap[circular.submittedHow]}</Grid>
        </Grid>
      )}
      <PlainTextBody>{circular.body}</PlainTextBody>
    </>
  )
}
