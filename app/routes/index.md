---
meta:
  title: GCN - General Coordinates Network
---

# Welcome to the General Coordinates Network (GCN)

<img src="https://gcn.gsfc.nasa.gov/GCN.gif" width="400" align="right" alt="GCN Diagram"/>

The General Coordinates Network (GCN) is a public collaboration platform run by NASA for the astronomy research community to share alerts and rapid communications about high-energy, multimessenger, and transient phenomena. GCN is the established platform for publishing discoveries and follow-up of gamma-ray bursts (GRBs), gravitational-wave (GW) compact binary mergers, and high-energy neutrinos. GCN distributes alerts between space- and ground-based observatories, physics experiments, and thousands of astronomers around the world.

The General Coordinates Network is the modern evolution of the Gamma-ray Coordinates Network (now referred to as GCN Classic, and formerly known as BACODINE/TAN), updated to use modern, open-source, reliable, and secure alert distribution technologies that have been established by the optical transient community.

## GCN Data Products:

- **Notices** are automated, machine-to-machine, generally real-time, notifications of detections and localizations of astronomical transients detected by space- and ground-based observatories.
- **Circulars** are human-readable, citable, rapid but generally not real-time, bulletins observations, quantitative near-term predictions, requests for follow-up observations, or future observing plans.

These two functions provide a robust interface for follow-up sites and GRB and transient researchers. The new GCN system uses the [Apache Kafka](https://kafka.apache.org) protocol for distributing Notices, and is operated within the Commercial managed Kafka system, [Confluent Platform](https://www.confluent.io), running in the Cloud. The Kafka system is compatible with hop-client, developed by [SCiMMA](https://scimma.org).

Users benefit to transitioning to the new GCN kafka distribution because it provides self-service subscription management, strong guarantees that all alerts are delivered exactly once, and a secure connection.

## The GCN system has three ways to access the data

| System                 | Transmission Protocols | Data Formats                   |
| ---------------------- | ---------------------- | ------------------------------ |
| GCN Classic            | Email, Socket          | Text, 160 byte Binary, VOEvent |
| GCN Classic over Kafka | Kafka                  | Text, 160 byte Binary, VOEvent |
| GCN                    | Kafka                  | Avro/JSON                      |

### GCN Classic

Legacy system run on premises at NASA/GSFC utilizing bespoke protocols for ingestion and distribution of transient data. New web application to modify your configurations coming soon. The GCN Classic system is being maintained until the community has fully transitioned to the new GCN

### GCN Classic over Kafka

Transition system serving legacy GCN Classic formats via Kafka.

### GCN

New system serving data in AVRO schema, which are JSON records. These schema have been formatted to provide uniformity between instruments wherever possible making it easier to compare records across missions. GCN provides both instrument specific topics as well as combined event based topics.

## Other Components of the New GCN

### GRB Name Server

In parnership with the [Transient Name Server](https://www.wis-tns.org), the GCN team is building a GRB name server that will allow GRB-detecting instruments to both name GRBs and retreive names of already discovered GRBs. These names will be automatically ingested into GCN and associated with GCN notices and circular for the same event. This feature will be available soon.

### GCN Viewer

The GCN Viewer provides a browse interface to the archive of the text versions of GCN Notices and Circulars organized by event and source type.
