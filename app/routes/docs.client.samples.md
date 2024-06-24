---
handle:
  breadcrumb: Sample Code
---

# Sample Code

Here is a collection of functions and example code that may be useful
when working with GCN Notices. These include conversions from
text and VOEvent alert formats to JSON and XML (for VOEvent alerts), how to save alerts,
and some samples from the FAQs section of the [gcn-kafka-python](https://github.com/nasa-gcn/gcn-kafka-python) repository.

To contribute your own ideas, make a GitHub pull request to add it to [the Markdown source for this document](https://github.com/nasa-gcn/gcn.nasa.gov/blob/CodeSamples/app/routes/docs.client.samples.md), or [contact us](/contact).

## Parsing XML

Within your consumer loop, use the following functions to convert the
content of `message.value()` into other data types.

The `xmltodict` package is not part of the Python standard library. You must install it by running:
pip:

```sh
pip install xmltodict
```

```python
import email
import xml.etree.ElementTree as ET
import xmltodict

def parse_text_alert_to_dict(message_value):
    return dict(email.message_from_bytes(message_value))

def parse_voevent_alert_to_xml_root(message_value):
    return ET.fromstring(message_value)

def parse_voevent_alert_to_dict(message_value):
    return xmltodict.parse(message_value)
```

## Saving

Use the following to save the data to a local file:

```python
import json

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

## Working With JSON Schema

For new missions, GCN Notices are preferably distributed in JSON format. This guide describes how to programmatically read the JSON schema.

## Parsing JSON

Read the JSON data from [sample.schema.json](https://gcn.nasa.gov/docs/notices/schema) and [sample.example.json](https://gcn.nasa.gov/docs/notices/schema), which parses it into Python dictionaries.

```python
import json

# Load and parse schema and example JSON files
with open('sample.schema.json', 'r') as schema_file:
    schema = json.load(schema_file)

with open('sample.example.json', 'r') as example_file:
    example = json.load(example_file)

print('Schema:', schema)
print('Example:', example)
```

## Encoding and Decoding of Embedded Data

The following code sample shows how to encode/decode a file in Python. The `base64` package includes the methods `b64decode` and `b64encode` to make this task simple.

```python
import base64

# Parse the content of your file to a base64 encoded string:
with open("path/to/your/file", 'rb') as file:
    encoded_string = base64.b64encode(file.read())

print(encoded_string)
# b'a1512dabc1b6adb3cd1b6dcb6d4c6......'

# Decode and write the content to a local file:
with open("path/to/destination/file", 'wb') as file:
    file.write(base64.b64decode(encoded_string))

```

If you want to include a FITS file in a Notice, you add a property to your schema definition in the following format:

```python
{
    type: 'string',
    contentEncoding: 'base64',
    contentMediaType: 'image/fits',
}
```

In your data production pipeline, you can use the encoding steps to convert your file to a bytestring and set the value of the property to this bytestring. See [non-JSON data](https://json-schema.org/understanding-json-schema/reference/non_json_data.html) for more information.
