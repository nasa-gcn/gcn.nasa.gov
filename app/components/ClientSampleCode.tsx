/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

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
  noticeTypes = [
    'gcn.classic.text.FERMI_GBM_FIN_POS',
    'gcn.classic.text.LVC_INITIAL',
  ],
  language,
}: {
  clientId?: string
  clientSecret?: string
  noticeTypes?: string[]
  language: 'python' | 'mjs'
}) {
  const domain = useDomain()

  let code
  switch (language) {
    case 'python':
      code = dedent`
        from gcn_kafka import Consumer

        # Connect as a consumer
        consumer = Consumer(client_id='${clientId}',
                            client_secret='${clientSecret}'${
        domain
          ? `,
                            domain='${domain}'`
          : ''
      })

        # List all topics
        print(consumer.list_topics().topics)

        # Subscribe to topics and receive alerts
        consumer.subscribe([${noticeTypes.map((noticeType) => `'${noticeType}'`)
          .join(`,
                            `)}])
        while True:
            for message in consumer.consume():
                print(message.value())
        `
      break
    case 'mjs':
      code = dedent`
        import { Kafka } from 'gcn-kafka'

        // Create a client
        const kafka = new Kafka({
          client_id: '${clientId}',
          client_secret: '${clientSecret}',${
        domain
          ? `
          domain: '${domain}',`
          : ''
      }
        })

        // List topics
        const admin = kafka.admin()
        const topics = await admin.listTopics()
        console.log(topics)

        // Subscribe to topics and receive alerts
        const consumer = kafka.consumer()
        await consumer.subscribe({
          topics: [${noticeTypes
            .map(
              (noticeType) => `
            '${noticeType}',`
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

  return <Highlight language={language} code={code} />
}
