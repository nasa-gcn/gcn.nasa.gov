---
handle:
  breadcrumb: Kafka Messages
---

# Consuming Kafka Messages

These examples focus on Kafka's functionality, such as message consumption and offset management.

## Saving Alert Data

Use the following to save the raw alert message data to a local file:

```python
def save_alert(message):
    with open('path/to/your/file', 'wb') as file:
        file.write(message.value())

```

## Keep track of the last read message when restarting a client

Kafka can keep track of which messages your client has read, allowing your client to recover
missed messages after a restart by beginning at the earliest unread message
rather than the next available message from the stream.

To enable this feature, you will need to set a client Group ID using
the configuration dictionary argument for the Consumer and change
the auto offset reset option to the 'earliest' setting. Once this is done,
every new client with the given Group ID will begin reading the specified topic
at the earliest unread message.

When doing this, it is recommended to turn **off** the auto commit
feature because it can lose track of the last read message if the client
crashes before the auto commit interval (5 seconds by default) occurs.
Manually committing messages (i.e. storing the state of the last read message)
once they are read is the most robust method for tracking the last read
message.

```python
from gcn_kafka import Consumer

config = {'group.id': 'my group name',
          'auto.offset.reset': 'earliest',
          'enable.auto.commit': False}

consumer = Consumer(config=config,
                    client_id='fill me in',
                    client_secret='fill me in',
                    domain='gcn.nasa.gov')

topics = ['gcn.classic.voevent.FERMI_GBM_SUBTHRESH']
consumer.subscribe(topics)

while True:
    for message in consumer.consume(timeout=1):
        if message.error():
            print(message.error())
            continue
        print(message.value())
        consumer.commit(message)
```

## Read messages beginning at the earliest available messages for a given stream

To read a given topic stream from the earliest message that is
present in the stream buffer, set the Group ID to an empty string and
applying the 'earliest' setting for the auto offset reset option in the
configuration dictionary argument for the Consumer class.

This feature allows the user to scan for older messages for testing purposes or
to recover messages that may have been missed due to a crash or network outage.
Keep in mind that the stream buffers are finite in size. They currently hold
messages from the past few days.

```python
from gcn_kafka import Consumer

config = {'auto.offset.reset': 'earliest'}

consumer = Consumer(config=config,
                    client_id='fill me in',
                    client_secret='fill me in',
                    domain='gcn.nasa.gov')

topics = ['gcn.classic.voevent.INTEGRAL_SPIACS']
consumer.subscribe(topics)

while True:
    for message in consumer.consume(timeout=1):
        if message.error():
            print(message.error())
            continue
        print(message.value())

```

## Search for messages occurring within a given date range

To search for messages in a given date range, use the `offsets_for_times()`
method from the Consumer class to get the message offsets for the desired date range.
Then assign the starting offset to the Consumer and read the desired number of messages.
When doing so, keep in mind that the stream buffers are finite in size. It is not
possible to recover messages prior to the start of the stream buffer. The GCN stream
buffers are currently set to hold messages from the past few days.

```python
import datetime
from gcn_kafka import Consumer
from confluent_kafka import TopicPartition

consumer = Consumer(client_id='fill me in',
                    client_secret='fill me in',
                    domain='gcn.nasa.gov')

# get messages occurring 3 days ago
timestamp1 = int((datetime.datetime.now() - datetime.timedelta(days=3)).timestamp() * 1000)
timestamp2 = timestamp1 + 86400000 # +1 day

topic = 'gcn.classic.voevent.INTEGRAL_SPIACS'
start = consumer.offsets_for_times(
    [TopicPartition(topic, 0, timestamp1)])
end = consumer.offsets_for_times(
    [TopicPartition(topic, 0, timestamp2)])

consumer.assign(start)
for message in consumer.consume(end[0].offset - start[0].offset, timeout=1):
    if message.error():
            print(message.error())
            continue
    print(message.value())
```
