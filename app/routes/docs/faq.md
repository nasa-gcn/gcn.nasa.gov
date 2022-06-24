---
meta:
  title: GCN - Frequently Asked Questions
---

# Frequently Asked Questions

## What is Kafka?

[Apache Kafka](https://kafka.apache.org) is an open-source distributed event streaming platform used in both commerical web applications
and in recent years, it has been widely adopted by the astronomical community. Utilizing a rich development environment with
open-source and commericially available tools, GCN is running a cloud-based high-reliability Kafka broker that distributes
GCN notices to users. Kafka is the platform of streaming data, and is agnostic of data format. However, GCN will transition to
distributing native Kafka Avro records (see [roadmap](docs/roadmap)), which can be losslessly converted between text based JSON records and a binary format.

## How do I start receving GCN notices via Kafka?

See [Client Configuration](docs/client).
