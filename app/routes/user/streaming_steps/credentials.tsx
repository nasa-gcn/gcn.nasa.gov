/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { Accordion, Fieldset, Radio } from '@trussworks/react-uswds'
import { useState } from 'react'
import { useClient } from '../streaming_steps'
import ClientCredentialCard from '~/components/ClientCredentialCard'
import type { ClientCredentialData } from '~/components/ClientCredentialCard'
import { Link, useLoaderData } from '@remix-run/react'
import { ClientCredentialVendingMachine } from '../client_credentials.server'
import type { DataFunctionArgs } from '@remix-run/node'
import type { AccordionItemProps } from '@trussworks/react-uswds/lib/components/Accordion/Accordion'
import ClientCredentialForm from '~/components/ClientCredentialForm'

export async function loader({ request }: DataFunctionArgs) {
  const machine = await ClientCredentialVendingMachine.create(request)
  const client_credentials = await machine.getClientCredentials()
  return { client_credentials }
}

export default function Credentials() {
  //Data passed between steps
  const clientData = useClient()
  // Data loaded for options
  const { client_credentials } =
    useLoaderData<Awaited<ReturnType<typeof loader>>>()
  const [items, setItems] = useState<ClientCredentialData[]>(client_credentials)
  const [linkDisabled, setLinkDisabled] = useState(
    clientData.codeSampleClientSecret == ''
  )
  const accordianItem: AccordionItemProps = {
    id: 'new-cred',
    title: 'New Credential',
    content: <ClientCredentialForm postClickHandler={pullClientCredentials} />,
    expanded: items.length == 0,
  }
  const accordianItems: AccordionItemProps[] = [accordianItem]

  function pullClientCredentials() {
    fetch('/api/client_credentials', {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((result) => result.json())
      .then((resultItems) => {
        setItems(resultItems)
      })
  }

  async function setClientIdAndSecret(clientId: string) {
    clientData.setCodeSampleClientId(clientId)
    fetch(`/api/client_credentials/client_data/${clientId}`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId: clientId }),
    })
      .then((result) => result.json())
      .then((credential) => {
        clientData.setCodeSampleClientSecret(credential.client_secret)
        setLinkDisabled(false)
      })
  }

  function handleDelete(client_id: string) {
    fetch(`/api/client_credentials/${client_id}`, {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((result) => {
      if (result.ok) {
        setItems(items.filter((item) => item.client_id != client_id))
      } else {
        console.log(result)
      }
    })
  }

  return (
    <>
      <p>
        Select from your available existing credentials or create a new one
        below.
      </p>
      <Fieldset>
        {items
          ? items.map((item) => (
              <Radio
                key={item.client_id}
                id={item.client_id}
                name="existing-client-creds"
                onClick={() => {
                  setClientIdAndSecret(item.client_id)
                }}
                label={
                  <ClientCredentialCard
                    listStyles={{ marginBottom: 0 }}
                    className="margin-bottom-0 border-0"
                    name={item.name}
                    client_id={item.client_id}
                    client_secret={item.client_secret}
                    created={item.created}
                    scope={item.scope}
                    onDelete={handleDelete}
                  />
                }
                tile
              />
            ))
          : null}
      </Fieldset>
      <br />
      <Accordion items={accordianItems} bordered />
      <Link type="button" className="usa-button" to="../">
        Back
      </Link>
      {linkDisabled ? null : (
        <Link type="button" className="usa-button" to="../alerts">
          Alerts
        </Link>
      )}
    </>
  )
}
