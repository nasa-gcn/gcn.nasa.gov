/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoaderFunctionArgs } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import type { ModalRef } from '@trussworks/react-uswds'
import {
  Button,
  Grid,
  Icon,
  Modal,
  ModalFooter,
  ModalHeading,
  ModalToggleButton,
} from '@trussworks/react-uswds'
import { useRef } from 'react'

import { getUser } from './_auth/user.server'
import HeadingWithAddButton from '~/components/HeadingWithAddButton'
import SegmentedCards from '~/components/SegmentedCards'
import Spinner from '~/components/Spinner'
import TimeAgo from '~/components/TimeAgo'
import type { KafkaACL } from '~/lib/kafka.server'
import { getKafkaACLsFromDynamoDB, getLastSyncDate } from '~/lib/kafka.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user) throw new Response(null, { status: 403 })
  const dynamoDbAclData = await getKafkaACLsFromDynamoDB(user)
  const latestSync = await getLastSyncDate()
  return { dynamoDbAclData, latestSync }
}

export default function Index() {
  const { dynamoDbAclData, latestSync } = useLoaderData<typeof loader>()
  const aclFetcher = useFetcher()

  return (
    <>
      <HeadingWithAddButton headingLevel={1}>Kafka Admin</HeadingWithAddButton>
      <h2>Kafka ACLs</h2>
      <p>
        Information about the Kafka ACLs listed here. Click the button to sync
        the db to the kafka broker's current state.
      </p>

      <aclFetcher.Form method="POST" action="/admin/kafka">
        <Button
          type="submit"
          name="intent"
          value="migrateFromBroker"
          disabled={aclFetcher.state !== 'idle'}
        >
          Pull ACLs from Broker
        </Button>
        {aclFetcher.state !== 'idle' && (
          <span className="text-middle">
            <Spinner /> Saving...
          </span>
        )}
      </aclFetcher.Form>
      {latestSync && (
        <p>
          Last synced by {latestSync.syncedBy}{' '}
          <TimeAgo time={latestSync.syncedOn} />
        </p>
      )}
      <h3>DynamoDB ACLs</h3>
      {dynamoDbAclData && (
        <>
          ({dynamoDbAclData.length}) ACLs
          <SegmentedCards>
            {dynamoDbAclData
              .sort((a, b) => a.topicName.localeCompare(b.topicName))
              .map((x, index) => (
                <KafkaAclCard key={index} acl={x} />
              ))}
          </SegmentedCards>
        </>
      )}
    </>
  )
}

function KafkaAclCard({ acl }: { acl: KafkaACL }) {
  const ref = useRef<ModalRef>(null)
  const fetcher = useFetcher()
  const disabled = fetcher.state !== 'idle'

  return (
    <>
      <Grid row style={disabled ? { opacity: '50%' } : undefined}>
        <div className="tablet:grid-col flex-fill">
          <div>
            <small>
              <strong>Topic:</strong> {acl.topicName}
            </small>
          </div>
          <div>
            <small>
              <strong>Permission Type:</strong> {acl.permissionType}
            </small>
          </div>
          <div>
            <small>
              <strong>Group:</strong> {acl.group}
            </small>
          </div>
        </div>
        <div className="tablet:grid-col flex-auto margin-y-auto">
          <ModalToggleButton
            opener
            disabled={disabled}
            modalRef={ref}
            type="button"
            className="usa-button--secondary"
          >
            <Icon.Delete
              role="presentation"
              className="bottom-aligned margin-right-05"
            />
            Delete
          </ModalToggleButton>
        </div>
      </Grid>
      <Modal
        id="modal-delete"
        ref={ref}
        aria-labelledby="modal-delete-heading"
        aria-describedby="modal-delete-description"
        renderToPortal={false}
      >
        <fetcher.Form method="POST" action="/admin/kafka">
          <input type="hidden" name="topicName" value={acl.topicName} />
          <input type="hidden" name="group" value={acl.group} />
          <input
            type="hidden"
            name="permissionType"
            value={acl.permissionType}
          />
          <ModalHeading id="modal-delete-heading">
            Delete Kafka ACL
          </ModalHeading>
          <p id="modal-delete-description">
            This will delete the DynamoDB entry and{' '}
            {acl.permissionType == 'consumer'
              ? '"read" and "describe"'
              : '"create", "write", and "describe"'}{' '}
            Kafka ACLs. Do you wish to continue?
          </p>
          <ModalFooter>
            <ModalToggleButton modalRef={ref} closer outline>
              Cancel
            </ModalToggleButton>
            <Button data-close-modal type="submit" name="intent" value="delete">
              Delete
            </Button>
          </ModalFooter>
        </fetcher.Form>
      </Modal>
    </>
  )
}
