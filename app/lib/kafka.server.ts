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

export let send: (topic: string, value: string) => Promise<void>

// FIXME: A single AWS Lambda execution environment can handle multiple
// invocations; AWS sends the runtime SIGTERM when it is time to shut down.
// However, @architect/sandbox does not properly simulate this behavior when it
// invokes a Lambda; rather than returning control after the Lambda handler
// returns, @architect/sandbox hangs until the Node.js runtime process
// terminates, or a timeout is reached, and then apparently kills the runtime
// process ungracefully. This is a problem if there are resources that are
// initialized during the invocation that have unsettled promises in the
// background that keep the Node.js runtime's event loop going.
//
// On AWS Lambda, we leave the Kafka connection open so that it is reused over
// multiple invocations and we register a beforeExit event handler to close it
// when the runtime is gracefully shutting down. However, until the above issue
// is fixed in @architect/sandbox, we need a separate code path for local
// testing.
if (process.env.ARC_SANDBOX) {
  send = async (topic, value) => {
    const producer = kafka.producer()
    await producer.connect()
    try {
      await producer.send({ topic, messages: [{ value }] })
    } finally {
      await producer.disconnect()
    }
  }
} else {
  // FIXME: remove memoizee and use top-level await once we switch to ESM builds.
  const getProducer = memoizee(
    async () => {
      const producer = kafka.producer()
      await producer.connect()
      ;['SIGINT', 'SIGTERM'].forEach((event) =>
        process.once(event, async () => {
          console.log('Disconnecting from Kafka')
          await producer.disconnect()
          console.log('Disconnected from Kafka')
        })
      )
      return producer
    },
    { promise: true }
  )

  send = async (topic, value) => {
    const producer = await getProducer()
    await producer.send({ topic, messages: [{ value }] })
  }
}
