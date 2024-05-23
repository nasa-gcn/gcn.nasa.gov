/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Kafka } from 'gcn-kafka'
import memoizee from 'memoizee'

import { domain, getEnvOrDie } from './env.server'

const client_id = getEnvOrDie('KAFKA_CLIENT_ID')
const client_secret = getEnvOrDie('KAFKA_CLIENT_SECRET')
const kafka = new Kafka({
  client_id,
  client_secret,
  domain,
})

// FIXME: remove memoizee and use top-level await once we switch to ESM builds.
const getProducer = memoizee(
  async () => {
    const producer = kafka.producer()
    await producer.connect()
    process.once('beforeExit', async () => {
      console.log('Disconnecting from Kafka')
      await producer.disconnect()
      console.log('Disconnected from Kafka')
    })
    return producer
  },
  { promise: true }
)

export async function send(topic: string, value: string) {
  const producer = await getProducer()
  await producer.send({ topic, messages: [{ value }] })
}
