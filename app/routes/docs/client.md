---
meta:
  title: GCN - Client Configuration
---

# Client Configuration

## Python

The [Python client](https://github.com/tachgsfc/gcn-kafka-python) is a very lightweight wrapper around [confluent-kafka-python](https://docs.confluent.io/platform/current/clients/confluent-kafka-python/html/index.html).

Run this command to install with [pip](https://pip.pypa.io/):

```sh
pip install gcn-kafka
```

or this command to install with with [conda](https://docs.conda.io/):

```sh
conda install -c conda-forge gcn-kafka
```

Sample code:

```python
from gcn_kafka import Consumer

# Connect as a consumer
consumer = Consumer(client_id='fill me in',
                    client_secret='fill me in',
                    domain='test.gcn.nasa.gov')

# List all topics
print(consumer.list_topics().topics)

# Subscribe to topics and receive alerts
consumer.subscribe(['gcn.classic.text.FERMI_GBM_FIN_POS',
                    'gcn.classic.text.LVC_INITIAL'])
while True:
    for message in consumer.consume():
        print(message.value())
```

## Node.js

The [Node.js client](https://github.com/tachgsfc/gcn-kafka-js) is a very lightweight wrapper around [Kafka.js](https://kafka.js.org).

To install [adc-streaming](https://pypi.org/project/adc-streaming/):

Run this command to install with [npm](https://www.npmjs.com):

```sh
npm install gcn-kafka
```

Sample code:

```mjs
import { Kafka } from 'gcn-kafka'

// Create a client
const kafka = new Kafka({
  client_id: 'fill me in',
  client_secret: 'fill me in',
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
```
