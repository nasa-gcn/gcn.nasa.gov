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
  Icon,
  Modal,
  ModalFooter,
  ModalHeading,
  ModalToggleButton,
  Table,
} from '@trussworks/react-uswds'
import { groupBy, sortBy } from 'lodash'
import { useEffect, useRef, useState } from 'react'

import { getUser } from './_auth/user.server'
import SegmentedCards from '~/components/SegmentedCards'
import Spinner from '~/components/Spinner'
import type { KafkaACL } from '~/lib/kafka.server'
import { adminGroup, getAclsFromBrokers } from '~/lib/kafka.server'
import { getFormDataString } from '~/lib/utils'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user || !user.groups.includes(adminGroup))
    throw new Response(null, { status: 403 })
  const { aclFilter } = Object.fromEntries(new URL(request.url).searchParams)

  const acls = await getAclsFromBrokers(user, aclFilter)

  const aclData = groupBy(
    sortBy(acls, ['resourceName', 'principal']),
    'resourceName'
  )
  const differentlySortedAclData = groupBy(
    sortBy(acls, ['principal', 'resourceName']),
    'principal'
  )
  return {
    aclData,
    differentlySortedAclData,
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getUser(request)
  if (!user?.groups.includes(adminGroup))
    throw new Response(null, { status: 403 })
  const data = await request.formData()
  const intent = getFormDataString(data, 'intent')
  console.log(intent)

  return null
}

export default function Index() {
  const { aclData, differentlySortedAclData } = useLoaderData<typeof loader>()
  const [acls, setAcls] = useState(aclData)
  const aclFetcher = useFetcher<typeof loader>()
  const brokerFromDbFetcher = useFetcher()

  useEffect(() => {
    setAcls(aclFetcher.data?.aclData ?? acls)
  }, [aclFetcher.data, acls])

  return (
    <>
      <h1>Kafka</h1>
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
      {brokerFromDbFetcher.state !== 'idle' && (
        <span className="text-middle">
          <Spinner /> Updating...
        </span>
      )}
      {differentlySortedAclData && (
        <>
          <SegmentedCards>
            {Object.keys(differentlySortedAclData)
              .sort((a, b) => a.localeCompare(b))
              .flatMap((key) => (
                <UserAclTable
                  key={key}
                  aclKey={key}
                  acls={differentlySortedAclData[key]}
                />
              ))}
          </SegmentedCards>
        </>
      )}
    </>
  )
}

function UserAclTable({ aclKey, acls }: { aclKey: string; acls: KafkaACL[] }) {
  const ref = useRef<ModalRef>(null)
  const fetcher = useFetcher()
  return (
    <>
      <span key={aclKey}>
        <div className="position-sticky top-0 bg-white z-100 padding-y-2 display-flex">
          <h3 className="padding-y-1 margin-y-0 margin-right-auto">
            User Group: {aclKey.replace('User:', '')}{' '}
            {aclKey.endsWith('.') ? '(Prefix)' : ''}
          </h3>
          <ModalToggleButton
            opener
            modalRef={ref}
            type="button"
            className="pull-right"
            outline
          >
            <Icon.Add className="bottom-aligned margin-right-05" />
            Add
          </ModalToggleButton>
        </div>
        <Table fullWidth>
          <thead>
            <tr>
              <th>Type</th>
              <th>Resource</th>
              <th>Permission</th>
              <th>Operation</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {acls.map((acl, index) => (
              <KafkaAclCard key={`${aclKey}-${index}`} acl={acl} />
            ))}
          </tbody>
        </Table>
      </span>
      <Modal
        id="modal-add"
        ref={ref}
        aria-labelledby="modal-add-heading"
        aria-describedby="modal-add-description"
        renderToPortal={false} // FIXME: https://github.com/trussworks/react-uswds/pull/1890#issuecomment-1023730448
      >
        <fetcher.Form method="POST">
          <input type="hidden" name="intent" value="add" />
          {/* <input type="hidden" name="clientId" value={client_id} /> */}
          <ModalHeading id="modal-deaddlete-heading">
            Add ACL Rule(s)
          </ModalHeading>
          <p id="modal-add-description">Add ACL rules for: {aclKey}</p>
          <ModalFooter>
            <ModalToggleButton modalRef={ref} closer outline>
              Cancel
            </ModalToggleButton>
            <Button data-close-modal type="submit">
              Add
            </Button>
          </ModalFooter>
        </fetcher.Form>
      </Modal>
    </>
  )
}

function KafkaAclCard({ acl }: { acl: KafkaACL }) {
  // TODO: These maps can probably be refactored, since they are
  // just inverting the enum from kafka, but importing them
  // directly here causes some errors. Same for mapping them to
  // dropdowns

  const fetcher = useFetcher()
  const permissionMap: { [key: number]: string } = {
    2: 'Deny',
    3: 'Allow',
  }

  const operationMap: { [key: number]: string } = {
    0: 'Unknown',
    1: 'Any',
    2: 'All',
    3: 'Read',
    4: 'Write',
    5: 'Create',
    6: 'Delete',
    7: 'Alter',
    8: 'Describe',
    9: 'Cluster Action',
    10: 'Describe Configs',
    11: 'Alter Configs',
    12: 'Idempotent Write',
  }

  const resourceTypeMap: { [key: number]: string } = {
    0: 'Unknown',
    1: 'Any',
    2: 'Topic',
    3: 'Group',
    4: 'Cluster',
    5: 'Transactional Id',
    6: 'Delegation Token',
  }

  return (
    <tr className="tablet:grid-col flex-fill margin-y-1">
      <td>
        {resourceTypeMap[acl.resourceType]}
        {acl.resourceName.endsWith('.') && <small> (Prefix)</small>}
      </td>
      <td>{acl.resourceName}</td>
      <td>{permissionMap[acl.permissionType]}</td>
      <td>{operationMap[acl.operation]}</td>
      <td>
        <fetcher.Form method="POST">
          <input type="hidden" name="intent" value="delete" />
          <Button type="submit" unstyled>
            Delete
          </Button>
        </fetcher.Form>
      </td>
    </tr>
  )
}
