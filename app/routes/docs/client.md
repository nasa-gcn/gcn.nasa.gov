---
meta:
  title: GCN - Client Configuration
---

# Client Configuration

## hop-client

To install [hop-client](https://pypi.org/project/hop-client/):

```sh
# pip install hop-client
pip install --extra-index-url https://asd.gsfc.nasa.gov/Leo.Singer/pypi hop-client adc_streaming==2.0.1.dev2+ga84d01f confluent-kafka==1.8.3+bleeding.edge
```

Python sample code:

```python
# TODO
```

## adc-streaming

To install [adc-streaming](https://pypi.org/project/adc-streaming/):

```sh
# pip install adc-streaming
pip install --extra-index-url https://asd.gsfc.nasa.gov/Leo.Singer/pypi adc_streaming==2.0.1.dev2+ga84d01f confluent-kafka==1.8.3+bleeding.edge
```

Python sample code:

```python
from adc.consumer import Consumer, ConsumerConfig, SASLAuth
from uuid import uuid4

# Fill in client credentials here
client_id = '...'
client_secret = '...'

auth = SASLAuth(
    client_id, client_secret,
    token_endpoint='https://gcn-tokens.auth.us-east-1.amazoncognito.com/oauth2/token')

config = ConsumerConfig(
    broker_urls=['GcnKa-Front-IHEMYJWGHZXT-d9d5d67a1752570b.elb.us-east-1.amazonaws.com:9093'],
    group_id=str(uuid4()), auth=auth)

consumer = Consumer(config)
consumer.subscribe('foobar')
for message in consumer.stream():
    print(message.value())
```

## confluent-kafka

To install [confluent-kafka](https://pypi.org/project/confluent-kafka/):

```sh
# pip install confluent-kafka
pip install --extra-index-url https://asd.gsfc.nasa.gov/Leo.Singer/pypi confluent-kafka==1.8.3+bleeding.edge
```

Python sample code:

```python
from confluent_kafka import Consumer
from uuid import uuid4

# Fill in client credentials here
client_id = '...'
client_secret = '...'

config = {
    'sasl.oauthbearer.client.id': client_id,
    'sasl.oauthbearer.client.secret': client_secret,
    'bootstrap.servers': 'GcnKa-Front-IHEMYJWGHZXT-d9d5d67a1752570b.elb.us-east-1.amazonaws.com:9093',
    'sasl.oauthbearer.token.endpoint.url': 'https://gcn-tokens.auth.us-east-1.amazoncognito.com/oauth2/token',
    'sasl.mechanisms': 'OAUTHBEARER',
    'sasl.oauthbearer.method': 'oidc',
    'security.protocol': 'sasl_ssl',
    'group.id': str(uuid4())
}

consumer = Consumer(config)
consumer.subscribe(['foobar'])
for message in consumer.consume():
    print(message.value())
```
