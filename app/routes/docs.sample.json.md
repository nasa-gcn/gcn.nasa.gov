---
handle:
  breadcrumb: JSON Format
---

# JSON Format

Here is a collection of functions and example code that may be useful when working with JSON Notices. This includes how to subscribe to Kafka topics, parse JSON data, and handle embedded data such as HEALPix sky maps.

## Parsing JSON

GCN Notices are distributed through Kafka topics and, for new missions, are typically provided in JSON format. This guide explains how to programmatically read the JSON schema.

Start by subscribing to a Kafka topic and parsing the JSON data.

```python
from gcn_kafka import Consumer
import json

# Kafka consumer configuration
consumer = Consumer(
    client_id='fill me in',
    client_secret='fill me in',
    config={"message.max.bytes": 204194304},
)

# Subscribe to Kafka topic
consumer.subscribe(['igwn.gwalert'])

# Continuously consume and parse JSON data
for message in consumer.consume(timeout=1):
    if message.error():
        print(message.error())
        continue

    # Print the topic and message ID
    print(f"topic={message.topic()}, offset={message.offset()}")

    # Decode message value
    value = message.value()
    value_str = value.decode("utf-8")
    alert_json = json.loads(value_str)
```

## Decoding Embedded Data

Some GCN notices include HEALPix sky maps encoded in [base64](https://datatracker.ietf.org/doc/html/rfc4648.html), a way of encoding binary data into text.
The following code demonstrates how to extract, decode, and save the HEALPix data as a `.fits` file from a received notice. Python's built-in [`base64`](https://docs.python.org/3/library/base64.html#base64.b64encode) module provides the `b64decode` method to simplify the decoding process.

```python
import base64
from astropy.io import fits

# Extract the base64-encoded skymap
skymap_string = alert_json["event"]["skymap"]

# Decode the Base64 string to bytes
decoded_bytes = base64.b64decode(skymap_string)

# Write bytes to a FITS file
with open("skymap.fits", "wb") as fits_file:
    fits_file.write(decoded_bytes)

# Open and inspect the FITS file
with fits.open("skymap.fits") as hdul:
    hdul.info()
```

## JSON Schema Example for Embedding a FITS File

If you want to include a FITS file in a Notice, add a property to your schema definition in the following format:

```json
"healpix_file": {
    "type": "string",
    "contentEncoding": "base64",
    "contentMediaType": "image/fits",
    "description": "Base 64 encoded content of a FITS file"
}
```

JSON Schema supports embedding non-Unicode media within strings using the `contentMediaType` and `contentEncoding`, which enable the distribution of diverse data types. For further details, refer to [non-JSON data](https://json-schema.org/understanding-json-schema/reference/non_json_data.html).

## Encoding Embedded Data

For producer data production pipelines, the following encoding steps convert an input file to a byte string. This guide demonstrates how to encode a file (e.g., skymap.fits) into a `base64` encoded string and submit it to the GCN Kafka broker.

```python
from gcn_kafka import Producer
import base64
import json

# Kafka Producer Configuration
producer = Producer(client_id='fill me in',
	client_secret='fill me in',
	config={"message.max.bytes": 204194304},

# Set Kafka Topic and Producer Configuration
TOPIC = "igwn.gwalert"

data = {
    "event": {}
}

# Read and encode the FITS file
with open("skymap.fits", "rb") as file:
	data["event"]["skymap"] = base64.b64encode(file.read())

# Convert dictionary to JSON
json_data = json.dumps(data).encode("utf-8")

# Publish the message
producer.produce(
	TOPIC,
	json_data,
)

producer.flush()
```
