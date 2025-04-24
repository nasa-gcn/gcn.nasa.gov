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
import { Highlight } from '~/components/Highlight'
import { Tab, Tabs } from '~/components/tabs'
import { formatAndNoticeTypeToTopic } from '~/lib/utils'
import { useFeature } from '~/root'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: 'Get Sample Code',
  getSitemapEntries: () => null,
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { clientId, noticeFormat, token, scope, ...rest } = Object.fromEntries(
    new URL(request.url).searchParams
  )
  const noticeTypes = Object.keys(rest)
  const machine = await ClientCredentialVendingMachine.create(request)
  const clientCredentialProps = clientId
    ? await machine.getClientCredential(clientId)
    : {
        client_id: null,
        client_secret: null,
        name: null,
      }
  return {
    noticeFormat,
    noticeTypes,
    token,
    scope,
    ...clientCredentialProps,
  }
}

export default function () {
  const {
    name: clientName,
    client_id: clientId,
    client_secret: clientSecret,
    token,
    scope,
    noticeFormat,
    noticeTypes,
  } = useLoaderData<typeof loader>()

  const topics = noticeTypes.map((noticeType) =>
    formatAndNoticeTypeToTopic(noticeFormat, noticeType)
  )

  const listTopics = false
  const tokenAuth = useFeature('TOKEN_AUTH')

  return (
    <>
      {tokenAuth && (
        <>
          <p>
            Our Kafka clients will use your token to authenticate you with our
            brokers. If you have not done so already create the following folder
            in your home directory to save your token:
          </p>
          <Highlight code="~/.gcn/" language="sh" />
          <p>
            Download your token and move it into this folder. Please do not
            rename this file, doing so may prevent our clients from finding it.
          </p>
          <Highlight
            code={token}
            language="txt"
            filename={scope.replace('/', '_')}
          />
        </>
      )}
      <Tabs>
        <Tab label="Python">
          <ClientSampleCode
            {...{
              clientName,
              clientId,
              clientSecret,
              topics,
              listTopics,
              scope,
            }}
            language="py"
          />
        </Tab>
        <Tab label="Node.js (ESM)">
          <ClientSampleCode
            {...{
              clientName,
              clientId,
              clientSecret,
              topics,
              listTopics,
              scope,
            }}
            language="mjs"
          />
        </Tab>
        <Tab label="Node.js (CommonJS)">
          <ClientSampleCode
            {...{
              clientName,
              clientId,
              clientSecret,
              topics,
              listTopics,
              scope,
            }}
            language="cjs"
          />
        </Tab>
        <Tab label="C/C++">
          <ClientSampleCode
            {...{
              clientName,
              clientId,
              clientSecret,
              topics,
              listTopics,
              scope,
            }}
            language="c"
          />
        </Tab>
        <Tab label="C#">
          <ClientSampleCode
            {...{
              clientName,
              clientId,
              clientSecret,
              topics,
              listTopics,
              scope,
            }}
            language="cs"
          />
        </Tab>
        <Tab label="Java">
          <ClientSampleCode
            {...{
              clientName,
              clientId,
              clientSecret,
              topics,
              listTopics,
              scope,
            }}
            language="java"
          />
        </Tab>
        <Tab label="PySpark">
          <ClientSampleCode
            {...{ clientName, clientId, clientSecret, topics, listTopics }}
            language="pyspark"
          />
        </Tab>
      </Tabs>
      <Form method="GET" action="../alerts">
        {token ? (
          <input type="hidden" name="token" value={token} />
        ) : (
          <input type="hidden" name="clientId" value={clientId ?? undefined} />
        )}
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
