/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import type { ModalRef } from '@trussworks/react-uswds'
import {
  Button,
  ButtonGroup,
  Grid,
  Icon,
  Modal,
  ModalHeading,
  ModalToggleButton,
} from '@trussworks/react-uswds'
import { useRef } from 'react'

import { getUser } from './_auth/user.server'
import { adminGroup } from './admin'
import SegmentedCards from '~/components/SegmentedCards'
import TimeAgo from '~/components/TimeAgo'
import { ToolbarButtonGroup } from '~/components/ToolbarButtonGroup'
import type { OpenSearchIndex } from '~/lib/opensearch.server'
import { listIndexes, triggerReindexQueue } from '~/lib/opensearch.server'
import { getFormDataString } from '~/lib/utils'

export async function action({ request }: ActionFunctionArgs) {
  const user = await getUser(request)
  if (!user?.groups.includes(adminGroup))
    throw new Response(null, { status: 403 })
  const data = await request.formData()
  const index = getFormDataString(data, 'index')
  if (!index) throw new Response(null, { status: 404 })
  await triggerReindexQueue(index)

  return null
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user?.groups.includes(adminGroup))
    throw new Response(null, { status: 403 })
  const indicies = await listIndexes()
  return { indicies }
}

export default function () {
  const data = useLoaderData<typeof loader>()

  return (
    <>
      <h1>OpenSearch</h1>
      <p>Manage OpenSearch indexes</p>
      <h3>Indexes</h3>
      <SegmentedCards>
        {data.indicies?.map((searchIndex) => (
          <SearchIndexCard key={searchIndex.uuid} searchIndex={searchIndex} />
        ))}
      </SegmentedCards>
    </>
  )
}

function SearchIndexCard({ searchIndex }: { searchIndex: OpenSearchIndex }) {
  const fetcher = useFetcher()
  const ref = useRef<ModalRef>(null)

  return (
    <>
      <Grid row key={searchIndex.uuid}>
        <div className="tablet:grid-col flex-fill">
          <div>
            <small>
              <strong>Name:</strong> {searchIndex.index}
            </small>
          </div>
          <div>
            <small>
              <strong>Health:</strong>
              <HealthIcons health={searchIndex.health} />
            </small>
          </div>
          <div>
            <small>
              <strong>Status:</strong> {searchIndex.status}
            </small>
          </div>
          <div>
            <small>
              <strong>Document Count:</strong> {searchIndex['docs.count']}
            </small>
          </div>
          {searchIndex.reindexTriggerTime && (
            <div>
              <small>
                <strong>Last Indexed:</strong>{' '}
                <TimeAgo time={searchIndex.reindexTriggerTime} />
              </small>
            </div>
          )}
        </div>
        <div className="tablet:grid-col flex-auto margin-y-auto">
          <ToolbarButtonGroup>
            <ModalToggleButton
              opener
              modalRef={ref}
              type="button"
              disabled={searchIndex.reindexStatus == 'RUNNING'}
            >
              <Icon.Update role="presentation" className="margin-y-neg-2px" />
              Reindex
            </ModalToggleButton>
          </ToolbarButtonGroup>
        </div>
      </Grid>
      <Modal
        id="reindexing-modal"
        ref={ref}
        aria-labelledby="modal-reindex-heading"
        aria-describedby="modal-reindex-description"
        renderToPortal={false} // FIXME: https://github.com/trussworks/react-uswds/pull/1890#issuecomment-1023730448
      >
        <ModalHeading id="modal-reindex-heading">
          Reindexing {searchIndex.index}
        </ModalHeading>
        <p id="modal-reindex-description">
          Reindexing will get all the associated records for {searchIndex.index}{' '}
          and update the existing index with the missing entries.
        </p>
        <p>
          There are currently {searchIndex['docs.count']} items in the index.
        </p>
        <p>
          This action may take some time, but should not affect the search page
          behavior.
        </p>
        <ButtonGroup>
          {/* TODO: Implement option for creation of new indexes with aliases */}
          <fetcher.Form method="POST">
            <input type="hidden" name="index" value={searchIndex.index} />
            <Button type="submit" className="margin-y-1" data-close-modal>
              Update Index
            </Button>
          </fetcher.Form>
        </ButtonGroup>
      </Modal>
    </>
  )
}

function HealthIcons({ health }: { health: string }) {
  switch (health) {
    case 'green':
      return <Icon.CheckCircleOutline color="green" />
    case 'yellow':
      return <Icon.Warning color="yellow" />
    case 'red':
      return <Icon.ErrorOutline color="red" />
    default:
      break
  }
}
