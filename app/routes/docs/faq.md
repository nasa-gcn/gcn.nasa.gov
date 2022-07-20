---
meta:
  title: GCN - Frequently Asked Questions
---

# Frequently Asked Questions

## What is Kafka?

According to the [Apache Kafka](https://kafka.apache.org) web site, “Apache Kafka is an open-source distributed event streaming platform used by thousands of companies for high-performance data pipelines, streaming analytics, data integration, and mission-critical applications.”

In recent years, Apache Kafka has seen wide adoption by the astronomy community, notably by the [Vera C. Rubin Observatory](https://www.lsst.org). GCN operates a highly available cluster of Kafka brokers in the cloud on Amazon Web Services that distributes GCN Notices to users.

The Kafka platform itself does not care about the format of the records. However, [Avro](https://avro.apache.org) and [JSON](https://www.json.org) are very common formats for Kafka records because of a rich ecosystem of open-source and commercial tools for them built on Kafka (for example: [Kafka Streams](https://kafka.apache.org/documentation/streams/), [ksqldb](https://ksqldb.io), [Kafka Connect](https://www.confluent.io/product/confluent-connectors/)). [The Vera C. Rubin Observatory's alert system](https://dmtn-093.lsst.io) uses Avro over the [Confluent Wire Format](https://docs.confluent.io/platform/current/schema-registry/serdes-develop/index.html). For these reaons, GCN is developing a unified schema for communicating Notices in Avro or JSON records over the Confluent Wire Format (see [roadmap](docs/roadmap)).

## How do I start receving GCN notices via Kafka?

See [Client Configuration](docs/client).

## What does the warning `Subscribed topic not available: gcn.classic.text.AGILE_GRB_GROUND: Broker: Unknown topic or partition'` mean?

This warning means that there have not been any recent alerts on that topic.
