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
  Grid,
  Icon,
  Label,
  Modal,
  ModalFooter,
  ModalHeading,
  ModalToggleButton,
  TextInput,
} from '@trussworks/react-uswds'
import { useEffect, useRef, useState } from 'react'

import { getUser } from './_auth/user.server'
import HeadingWithAddButton from '~/components/HeadingWithAddButton'
import SegmentedCards from '~/components/SegmentedCards'
import Spinner from '~/components/Spinner'
import TimeAgo from '~/components/TimeAgo'
import type { KafkaACL, UserClientType } from '~/lib/kafka.server'
import {
  adminGroup,
  createKafkaACL,
  deleteKafkaACL,
  getKafkaACLsFromDynamoDB,
  getLastSyncDate,
  updateBrokersFromDb,
  updateDbFromBrokers,
} from '~/lib/kafka.server'
import { getFormDataString } from '~/lib/utils'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user || !user.groups.includes(adminGroup))
    throw new Response(null, { status: 403 })
  const { aclFilter } = Object.fromEntries(new URL(request.url).searchParams)
  const dynamoDbAclData = await getKafkaACLsFromDynamoDB(user, aclFilter)
  const latestSync = await getLastSyncDate()
  return { dynamoDbAclData, latestSync }
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getUser(request)
  if (!user?.groups.includes(adminGroup))
    throw new Response(null, { status: 403 })
  const data = await request.formData()
  const intent = getFormDataString(data, 'intent')
  if (intent === 'migrateFromBroker') {
    await updateDbFromBrokers(user)
    return null
  }

  if (intent === 'migrateFromDB') {
    await updateBrokersFromDb(user)
    return null
  }

  const aclId = getFormDataString(data, 'aclId')
  const promises = []

  switch (intent) {
    case 'delete':
      if (!aclId) throw new Response(null, { status: 400 })
      promises.push(deleteKafkaACL(user, [aclId]))
      break
    case 'create':
      const resourceName = getFormDataString(data, 'resourceName')
      const userClientType = getFormDataString(
        data,
        'userClientType'
      ) as UserClientType
      const permissionTypeString = getFormDataString(data, 'permissionType')
      const group = getFormDataString(data, 'group')
      const includePrefixed = getFormDataString(data, 'includePrefixed')
      const resourceTypeString = getFormDataString(data, 'resourceType')

      if (
        !resourceName ||
        !userClientType ||
        !group ||
        !permissionTypeString ||
        !resourceTypeString
      )
        throw new Response(null, { status: 400 })

      const permissionType = parseInt(permissionTypeString) // Allow, deny
      const resourceType = parseInt(resourceTypeString)

      promises.push(
        createKafkaACL(
          user,
          userClientType,
          resourceName,
          group,
          permissionType,
          resourceType,
          Boolean(includePrefixed)
        )
      )

      break
    default:
      break
  }
  await Promise.all(promises)

  return null
}

export default function Index() {
  const { dynamoDbAclData, latestSync } = useLoaderData<typeof loader>()
  const [aclData, setAclData] = useState(dynamoDbAclData)
  const updateFetcher = useFetcher<typeof action>()
  const aclFetcher = useFetcher<typeof loader>()
  const brokerFromDbFetcher = useFetcher()

  useEffect(() => {
    setAclData(aclFetcher.data?.dynamoDbAclData ?? aclData)
  }, [aclFetcher.data, aclData])

  return (
    <>
      <HeadingWithAddButton headingLevel={1}>Kafka</HeadingWithAddButton>
      <h2>Kafka ACLs</h2>
      <p className="usa-paragraph">
        Kafka Access Control Lists (ACLs) are a security mechanism used to
        control access to resources within a Kafka cluster. They define which
        users or client applications have permissions to perform specific
        operations on Kafka resources, such as topics, consumer groups, and
        broker resources. ACLs specify who can produce (write) or consume (read)
        data from topics, create or delete topics, manage consumer groups, and
        perform administrative tasks.
      </p>

      <updateFetcher.Form method="POST" action="/admin/kafka">
        <Button
          type="submit"
          name="intent"
          value="migrateFromBroker"
          disabled={
            updateFetcher.state !== 'idle' ||
            brokerFromDbFetcher.state !== 'idle'
          }
        >
          Pull ACLs from Broker
        </Button>
        {updateFetcher.state !== 'idle' && (
          <span className="text-middle">
            <Spinner /> Updating...
          </span>
        )}
      </updateFetcher.Form>
      {latestSync && (
        <p>
          Last synced by {latestSync.syncedBy}{' '}
          <TimeAgo time={latestSync.syncedOn} />
        </p>
      )}

      <brokerFromDbFetcher.Form>
        <Button
          type="submit"
          name="intent"
          value="migrateFromDB"
          disabled={
            updateFetcher.state !== 'idle' ||
            brokerFromDbFetcher.state !== 'idle'
          }
        >
          Update Broker from DB
        </Button>
        {brokerFromDbFetcher.state !== 'idle' && (
          <span className="text-middle">
            <Spinner /> Updating...
          </span>
        )}
      </brokerFromDbFetcher.Form>

      {aclData && (
        <>
          <aclFetcher.Form method="GET">
            <Label htmlFor="aclFilter">Filter ({aclData.length} results)</Label>
            <TextInput id="aclFilter" name="aclFilter" type="text" />
            <Button
              type="submit"
              className="margin-y-1"
              disabled={aclFetcher.state !== 'idle'}
            >
              Search
            </Button>
            {aclFetcher.state !== 'idle' && (
              <span className="text-middle">
                <Spinner /> Loading...
              </span>
            )}
          </aclFetcher.Form>
          <SegmentedCards>
            {aclData
              .sort((a, b) => a.resourceName.localeCompare(b.resourceName))
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

  const permissionMap: { [key: number]: string } = {
    2: 'Deny',
    3: 'Allow',
  }

  return (
    <>
      <Grid row style={disabled ? { opacity: '50%' } : undefined}>
        <div className="tablet:grid-col flex-fill">
          <div>
            <strong>Group:</strong> {acl.principal}
          </div>
          {/* <div>
            <strong>Client Type:</strong> {acl.userClientType}
          </div> */}
          <div>
            <strong>Permission:</strong> {permissionMap[acl.permissionType]}
          </div>
          <div>
            <strong>Resource:</strong> {acl.resourceName}
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
          <input type="hidden" name="aclId" value={acl.aclId} />
          <ModalHeading id="modal-delete-heading">
            Delete Kafka ACL
          </ModalHeading>
          <p id="modal-delete-description">
            This will delete the DynamoDB entry and associated "read","create",
            "write", and "describe" ACLs. Do you wish to continue?
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
