/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import Tabs from '~/components/Tabs'
import { ClientSampleCode } from '~/components/ClientSampleCode'
import { Form, useLoaderData } from '@remix-run/react'
import type { DataFunctionArgs } from '@remix-run/node'
import { ClientCredentialVendingMachine } from '../user/client_credentials.server'
import { Button, Link } from '@trussworks/react-uswds'

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
  } = useLoaderData<Awaited<ReturnType<typeof loader>>>()

  const topics = noticeTypes.map(
    (noticeType) => `gcn.classic.${noticeFormat}.${noticeType}`
  )
  const listTopics = false

  const tabs = [
    {
      label: 'Python',
      Component: ClientSampleCode({
        clientId,
        clientSecret,
        topics,
        listTopics,
        language: 'python',
      }),
    },
    {
      label: 'JavaScript',
      Component: ClientSampleCode({
        clientId,
        clientSecret,
        topics,
        listTopics,
        language: 'mjs',
      }),
    },
  ]

  return (
    <>
      <div>
        You will need the gcn-kafka package to stream with this API. For python
        users, run this command to install with{' '}
        <Link href="https://pip.pypa.io/">pip</Link>:
        <pre>
          <code className="hljs language-sh">pip install gcn-kafka</code>
        </pre>
        or this command to install with with{' '}
        <Link href="https://docs.conda.io/">conda</Link> :
        <pre>
          <code className="hljs language-sh">
            conda install -c conda-forge gcn-kafka
          </code>
        </pre>
        For Javascript (Node) use, run the following to install with npm
        <pre>
          <code className="hljs language-sh">npm install gcn-kafka</code>
        </pre>
        Here is a sample to print the alerts to your console, feel free to edit
        it and use it as you need.
      </div>
      <br />
      <Tabs tabs={tabs} />
      <Form method="get" action="../alerts">
        <input type="hidden" name="clientId" value={clientId} />
        <Button type="submit" className="usa-button--outline">
          Back
        </Button>
      </Form>
    </>
  )
}
