---
handle:
  breadcrumb: About GCN
---

# What is GCN?

The General Coordinates Network (GCN) is a public collaboration platform run by NASA for the astronomy research community to share alerts and rapid communications about high-energy, multimessenger, and transient phenomena. GCN is the established platform for publishing discoveries and follow-up of gamma-ray bursts (GRBs), gravitational-wave (GW) compact binary mergers, and high-energy neutrinos. GCN distributes alerts between space- and ground-based observatories, physics experiments, and thousands of astronomers around the world.

The General Coordinates Network is the modern evolution of the [Gamma-ray Coordinates Network](https://gcn.gsfc.nasa.gov) (now referred to as GCN Classic, and formerly known as BACODINE/TAN), updated to use modern, open-source, reliable, and secure alert distribution technologies that have been established by the broader astronomy community.

GCN has two kinds of data products:

- [**Notices**](/notices) are automated, machine-to-machine, generally real-time, notifications of detections and localizations of astronomical transients detected by space- and ground-based observatories.
- [**Circulars**](/circulars) are human-readable, citable, rapid but generally not real-time, bulletins observations, quantitative near-term predictions, requests for follow-up observations, or future observing plans.

## Contributing

The GCN web site is an open source project built in [Remix](https://remix.run), a full stack web framework. Have an idea to make GCN better and want to contribute, or have a bug to report? Head over to our [contributing](/docs/contributing) documentation for our quick start instructions.

## Kafka Client Configuration

To begin receiving GCN notices via Kafka, users have two options for setting up their listeners. The [Kafka Client Setup](/docs/client) section describes how to connect to Kafka using [Python](/docs/client#python) or [JavaScript](/docs/client#nodejs). Once the listener is set up, users can specify which Kafka topics they wish to follow for different GCN notice types.

## History

Learn about how and why GCN was created, and how it became an essential component of multimessenger astrophysics in the [History of GCN](/docs/history).
