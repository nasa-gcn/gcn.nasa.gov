/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import dedent from 'ts-dedent'

import { Highlight } from './Highlight'
import { useFeature } from '~/root'

export function ProducerSampleCode() {
  const showSchema = useFeature('SCHEMA')
  return (
    <>
      {showSchema ? (
        <Highlight
          language="py"
          code={dedent(`
          from gcn_kafka import Producer
          # Connect as a producer.
          # Warning: don't share the client secret with others.
          producer = Producer(client_id='fill me in', client_secret='fill me in')
          # any topic starting with 'mission.'
          topic = 'gcn.notices.mission'
          # JSON data converted to byte string format
          data = json.dumps({
            '$schema': 'https://gcn.nasa.gov/schema/main/gcn/notices/mission/SchemaName.schema.json',
            'key': 'value'
          }).encode() # Parse URL of your schema
          producer.produce(topic, data)`)}
        />
      ) : (
        <Highlight
          language="py"
          code={dedent(`
          from gcn_kafka import Producer
          # Connect as a producer.
          # Warning: don't share the client secret with others.
          producer = Producer(client_id='fill me in', client_secret='fill me in')
          # any topic starting with 'mission.'
          topic = 'gcn.notices.mission.example'
          data = b'...'  # any bytes
          producer.produce(topic, data)`)}
        />
      )}
    </>
  )
}
