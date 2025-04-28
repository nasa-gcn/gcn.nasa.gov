/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SEOHandle } from '@nasa-gcn/remix-seo'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { Button, ButtonGroup, FormGroup } from '@trussworks/react-uswds'

import { ClientCredentialVendingMachine } from './user.credentials/client_credentials.server'
import { ClientSampleCode } from '~/components/ClientSampleCode'
import { Tab, Tabs } from '~/components/tabs'
import { formatAndNoticeTypeToTopic } from '~/lib/utils'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: 'Get Sample Code',
  getSitemapEntries: () => null,
}

export async function loader({ request }: LoaderFunctionArgs) {
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
    name: clientName,
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
            {...{ clientName, clientId, clientSecret, topics, listTopics }}
            language="py"
          />
        </Tab>
        <Tab label="Node.js (ESM)">
          <ClientSampleCode
            {...{ clientName, clientId, clientSecret, topics, listTopics }}
            language="mjs"
          />
        </Tab>
        <Tab label="Node.js (CommonJS)">
          <ClientSampleCode
            {...{ clientName, clientId, clientSecret, topics, listTopics }}
            language="cjs"
          />
        </Tab>
        <Tab label="C/C++">
          <ClientSampleCode
            {...{ clientName, clientId, clientSecret, topics, listTopics }}
            language="c"
          />
        </Tab>
        <Tab label="C#">
          <ClientSampleCode
            {...{ clientName, clientId, clientSecret, topics, listTopics }}
            language="cs"
          />
        </Tab>
        <Tab label="Java">
          <ClientSampleCode
            {...{ clientName, clientId, clientSecret, topics, listTopics }}
            language="java"
          />
        </Tab>
      </Tabs>
      <Form method="GET" action="../alerts">
        <input type="hidden" name="clientId" value={clientId} />
        <input type="hidden" name="noticeFormat" value={noticeFormat} />
        {noticeTypes.map((notice) => (
          <input key={notice} type="hidden" name="alerts" value={notice} />
        ))}
        <FormGroup>
          <ButtonGroup>
            <Button type="submit" className="usa-button--outline">
              Back
            </Button>
            <Link to="/user/credentials">
              <Button type="button">Done</Button>
            </Link>
          </ButtonGroup>
        </FormGroup>
      </Form>
    </>
  )
}
