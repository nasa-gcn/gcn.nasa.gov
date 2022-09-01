/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { Tab, Tabs } from '~/components/Tabs'
import { ClientSampleCode } from '~/components/ClientSampleCode'
import { Form, useLoaderData } from '@remix-run/react'
import type { DataFunctionArgs } from '@remix-run/node'
import { ClientCredentialVendingMachine } from '../user/client_credentials.server'
import { Button } from '@trussworks/react-uswds'
import { formatAndNoticeTypeToTopic } from '~/lib/utils'

export async function loader({ request }: DataFunctionArgs) {
  const { clientId, noticeFormat, ...rest } = Object.fromEntries(
    new URL(request.url).searchParams
  )
  const noticeTypes = Object.keys(rest)
  const machine = await ClientCredentialVendingMachine.create(request)
  const clientCredentialProps = await machine.getClientCredential(clientId)
  return {
    noticeFormat,
    noticeTypes,
    ...clientCredentialProps,
  }
}

export default function Code() {
  const {
    client_id: clientId,
    client_secret: clientSecret,
    noticeFormat,
    noticeTypes,
  } = useLoaderData<typeof loader>()

  const topics = noticeTypes.map((noticeType) =>
    formatAndNoticeTypeToTopic(noticeFormat, noticeType)
  )

  const listTopics = false

  return (
    <>
      <Tabs>
        <Tab label="Python">
          <ClientSampleCode
            {...{ clientId, clientSecret, topics, listTopics }}
            language="py"
          />
        </Tab>
        <Tab label="JavaScript">
          <ClientSampleCode
            {...{ clientId, clientSecret, topics, listTopics }}
            language="js"
          />
        </Tab>
      </Tabs>
      <Form method="get" action="../alerts">
        <input type="hidden" name="clientId" value={clientId} />
        <Button type="submit" className="usa-button--outline">
          Back
        </Button>
      </Form>
    </>
  )
}
