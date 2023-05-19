/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { DataFunctionArgs } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { Button } from '@trussworks/react-uswds'

import { ClientCredentialVendingMachine } from '../user/client_credentials.server'
import { ClientSampleCode } from '~/components/ClientSampleCode'
import { Tab, Tabs } from '~/components/Tabs'
import { formatAndNoticeTypeToTopic } from '~/lib/utils'

export const handle = {
  breadcrumb: 'Get Sample Code',
  getSitemapEntries: () => null,
}

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

export default function () {
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
        <Tab label="Node.js (ESM)">
          <ClientSampleCode
            {...{ clientId, clientSecret, topics, listTopics }}
            language="mjs"
          />
        </Tab>
        <Tab label="Node.js (CommonJS)">
          <ClientSampleCode
            {...{ clientId, clientSecret, topics, listTopics }}
            language="cjs"
          />
        </Tab>
        <Tab label="C/C++">
          <ClientSampleCode
            {...{ clientId, clientSecret, topics, listTopics }}
            language="c"
          />
        </Tab>
        <Tab label="C#">
          <ClientSampleCode
            {...{ clientId, clientSecret, topics, listTopics }}
            language="cs"
          />
        </Tab>
      </Tabs>
      <Form method="GET" action="../alerts">
        <input type="hidden" name="clientId" value={clientId} />
        <Button type="submit" className="usa-button--outline">
          Back
        </Button>
        <Link to="/user/credentials">
          <Button type="button">Done</Button>
        </Link>
      </Form>
    </>
  )
}
