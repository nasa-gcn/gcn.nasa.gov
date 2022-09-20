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
  language: 'py' | 'mjs' | 'cjs'
}) {
  const domain = useDomain()

  switch (language) {
    case 'py':
      return (
        <>
          Open a terminal and run this command to install with{' '}
          <Link rel="external" href="https://pip.pypa.io/">
            pip
          </Link>
          :
          <Highlight language="sh" code="pip install gcn-kafka" />
          or this command to install with with{' '}
          <Link rel="external" href="https://docs.conda.io/">
            conda
          </Link>
          :
          <Highlight
            language="sh"
            code="conda install -c conda-forge gcn-kafka"
          />
          Save the Python code below to a file called <code>example.py</code>:
          <Highlight
            language={language}
            filename={`example.${language}`}
            code={dedent`
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
                      value = message.value()
                      print(value)
              `}
          />
          Run the code by typing this command in the terminal:
          <Highlight language="sh" code="python example.py" />
        </>
      )
    case 'mjs':
      return (
        <>
          Open a terminal and run this command to install with{' '}
          <Link rel="external" href="https://www.npmjs.com">
            npm
          </Link>
          :
          <Highlight language="sh" code="npm install gcn-kafka" />
          Save the JavaScript code below to a file called{' '}
          <code>example.mjs</code>:
          <Highlight
            language={language}
            filename={`example.${language}`}
            code={dedent`
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
            try {
              await consumer.subscribe({
                topics: [${topics
                  .map(
                    (topic) => `
                    '${topic}',`
                  )
                  .join('')}
                ],
              })
            } catch (error) {
              if (error.type === 'TOPIC_AUTHORIZATION_FAILED')
              {
                console.warn('Not all subscribed topics are available')
              } else {
                throw error
              }
            }            

            await consumer.run({
              eachMessage: async (payload) => {
                const value = payload.message.value
                console.log(value?.toString())
              },
            })`}
          />
          Run the code by typing this command in the terminal:
          <Highlight language="sh" code="node example.mjs" />
        </>
      )
    case 'cjs':
      return (
        <>
          Open a terminal and run this command to install with{' '}
          <Link rel="external" href="https://www.npmjs.com">
            npm
          </Link>
          :
          <Highlight language="sh" code="npm install gcn-kafka" />
          Save the JavaScript code below to a file called{' '}
          <code>example.cjs</code>:
          <Highlight
            language={language}
            filename={`example.${language}`}
            code={dedent`
            const { Kafka } = require('gcn-kafka');

            (async () => {  
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
              try {
                await consumer.subscribe({
                  topics: [${topics
                    .map(
                      (topic) => `
                      '${topic}',`
                    )
                    .join('')}
                  ],
                })
              } catch (error) {
                if (error.type === 'TOPIC_AUTHORIZATION_FAILED')
                {
                  console.warn('Not all subscribed topics are available')
                } else {
                  throw error
                }
              }
              
              await consumer.run({
                eachMessage: async (payload) => {
                  const value = payload.message.value
                  console.log(value?.toString())
                },
              })
            })()`}
          />
          Run the code by typing this command in the terminal:
          <Highlight language="sh" code="node example.cjs" />
        </>
      )
  }
}
