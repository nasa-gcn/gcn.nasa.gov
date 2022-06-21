/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { Highlight } from './Highlight'

export function GcnKafkaPythonSampleCode({
  clientId,
  clientSecret,
}: {
  clientId?: string
  clientSecret?: string
}) {
  return (
    <Highlight
      language="python"
      code={`from gcn_kafka import Consumer

# Connect as a consumer
consumer = Consumer(client_id='${clientId ?? 'fill me in'}',
                    client_secret='${clientSecret ?? 'fill me in'}',
                    domain='test.gcn.nasa.gov')

# List all topics
print(consumer.list_topics().topics)

# Subscribe to topics and receive alerts
consumer.subscribe(['gcn.classic.text.FERMI_GBM_FIN_POS',
                    'gcn.classic.text.LVC_INITIAL'])
while True:
    for message in consumer.consume():
        print(message.value())
`}
    />
  )
}

export function GcnKafkaJsSampleCode({
  clientId,
  clientSecret,
}: {
  clientId?: string
  clientSecret?: string
}) {
  return (
    <Highlight
      language="mjs"
      code={`import { Kafka } from 'gcn-kafka'

// Create a client
const kafka = new Kafka({
  client_id: '${clientId ?? 'fill me in'}',
  client_secret: '${clientSecret ?? 'fill me in'}',
  domain: 'test.gcn.nasa.gov',
})

// List topics
const admin = kafka.admin()
const topics = await admin.listTopics()
console.log(topics)

// Subscribe to topics and receive alerts
const consumer = kafka.consumer()
await consumer.subscribe({
  topics: [
    'gcn.classic.text.FERMI_GBM_FIN_POS',
    'gcn.classic.text.LVC_INITIAL',
  ],
})

await consumer.run({
  eachMessage: async (payload) => {
    const value = payload.message.value
    console.log(value?.toString())
  },
})
`}
    />
  )
}
