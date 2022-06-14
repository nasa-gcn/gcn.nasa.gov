---
meta:
  title: GCN - About
---

# About GCN

The General Coordinates Network (GCN) is a public collaboration platform run by NASA for the astronomy research community to share alerts and rapid communications about high-energy, multimessenger, and transient phenomena.

GCN is the established platform for publishing discoveries and follow-up of gamma-ray bursts (GRBs), gravitational-wave (GW) compact binary mergers, and high-energy neutrinos. GCN distributes alerts between space- and ground-based observatories, physics experiments, and thousands of astronomers around the world.

# Documentation

## Client Configuration

To begin receiving GCN notices via kafka, users have three options for setting up their listeners. GCN [Client Configuration](/docs/client) documentation for [**hop-client**](/docs/client#hop-client), [**adc-streaming**](/docs/client#adc-streaming) and [**confluent-kafka**](/docs/client#confluent-kafka). Once the listener is setup, users can specify which Kafka topics they wish to follow for different GCN notice types.

## Contributing

The GCN website is an open source project built in [Remix](https://remix.run), a full stack web framework. Have an idea to make GCN better and want to contribute, or have a bug to report? Head over to our [contributing](/docs/contributing) documentation for our quick start instructions.

## Roadmap

Check out our [roadmap](/docs/roadmap) for features that are under development, including the Unified Schema and the GRB Name Server.
