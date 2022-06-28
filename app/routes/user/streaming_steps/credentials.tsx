import { Accordion, Fieldset, Radio } from '@trussworks/react-uswds'
import { useState } from 'react'
import { useClient } from '../streaming_steps'
import ClientCredentialCard from '~/components/ClientCredentialCard'
import type { ClientCredentialData } from '~/components/ClientCredentialCard'
import { useLoaderData } from '@remix-run/react'
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
    useLoaderData<Awaited<ReturnType<typeof loader>>>() ?? []
  const [items, setItems] = useState<ClientCredentialData[]>(client_credentials)

  const accordianItem: AccordionItemProps = {
    id: 'new-cred',
    title: 'New Credential',
    content: <ClientCredentialForm setItems={setItems} />,
    expanded: items.length == 0,
  }
  const accordianItems: AccordionItemProps[] = [accordianItem]

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
                  // //getSecret() -> then call next line
                  clientData.setCodeSampleClientId(item.client_id)
                  //clientData.setCodeSampleClientSecret(item.client_secret)
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
                  />
                }
                tile
              />
            ))
          : null}
      </Fieldset>
      <br />
      <Accordion items={accordianItems} bordered />
    </>
  )
}
