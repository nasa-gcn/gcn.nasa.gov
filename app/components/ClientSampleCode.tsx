/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { Link } from '@trussworks/react-uswds'
import dedent from 'dedent'
import { useHostname } from '~/root'
import { Highlight } from './Highlight'

function useDomain() {
  const hostname = useHostname()

  if (hostname === 'gcn.nasa.gov') {
    return null
  } else if (hostname?.endsWith('gcn.nasa.gov')) {
    return hostname
  } else {
    return 'test.gcn.nasa.gov'
  }
}

export function ClientSampleCode({
  clientId = 'fill me in',
  clientSecret = 'fill me in',
  listTopics = true,
  topics = [
    'gcn.classic.text.FERMI_GBM_FIN_POS',
    'gcn.classic.text.LVC_INITIAL',
  ],
  language,
}: {
  clientId?: string
  clientSecret?: string
  listTopics?: boolean
  topics?: string[]
  language: 'python' | 'mjs'
}) {
  const domain = useDomain()

  let code
  let instructions
  let suffix

  switch (language) {
    case 'python':
      suffix = 'py'
      instructions = (
        <>
          <p>
            Open a terminal and run this command to install with{' '}
            <Link rel="external" href="https://pip.pypa.io/">
              pip
            </Link>
            :
          </p>
          <Highlight language="sh" code="pip install gcn-kafka" />
          <p>
            or this command to install with with{' '}
            <Link rel="external" href="https://docs.conda.io/">
              conda
            </Link>
            :
          </p>
          <Highlight
            language="sh"
            code="conda install -c conda-forge gcn-kafka"
          />
        </>
      )
      code = dedent`
        from gcn_kafka import Consumer

        # Connect as a consumer.
        # Warning: don't share the client secret with others.
        consumer = Consumer(client_id='${clientId}',
                            client_secret='${clientSecret}'${
        domain
          ? `,
                            domain='${domain}'`
          : ''
      })
      ${
        listTopics
          ? `
        # List all topics
        print(consumer.list_topics().topics)
        `
          : ''
      }
        # Subscribe to topics and receive alerts
        consumer.subscribe([${topics.map((topic) => `'${topic}'`).join(`,
                            `)}])
        while True:
            for message in consumer.consume():
                print(message.value())
        `
      break
    case 'mjs':
      suffix = 'js'
      instructions = (
        <>
          <p>
            Open a terminal and run this command to install with{' '}
            <Link rel="external" href="https://www.npmjs.com">
              npm
            </Link>
            :
          </p>
          <Highlight language="sh" code="npm install gcn-kafka" />
        </>
      )
      code = dedent`
        import { Kafka } from 'gcn-kafka'

        // Create a client.
        // Warning: don't share the client secret with others.
        const kafka = new Kafka({
          client_id: '${clientId}',
          client_secret: '${clientSecret}',${
        domain
          ? `
          domain: '${domain}',`
          : ''
      }
        })
      ${
        listTopics
          ? `
        // List topics
        const admin = kafka.admin()
        const topics = await admin.listTopics()
        console.log(topics)
        `
          : ''
      }
        // Subscribe to topics and receive alerts
        const consumer = kafka.consumer()
        await consumer.subscribe({
          topics: [${topics
            .map(
              (topic) => `
            '${topic}',`
            )
            .join('')}
          ],
        })

        await consumer.run({
          eachMessage: async (payload) => {
            const value = payload.message.value
            console.log(value?.toString())
          },
        })
        `
      break
  }

  return (
    <>
      {instructions}
      Sample code:
      <Highlight
        language={language}
        code={code}
        filename={`example.${suffix}`}
      />
    </>
  )
}
