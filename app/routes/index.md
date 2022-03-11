---
meta:
  title: GCN - General Coordinates Network
---

# Welcome to the General Coordinates Network (GCN)

GCN is the NASA broker for transient alerts and community reports from space- and ground-based missions, observatories, and experiments used by the multimessenger and time-domain astrophysics communities. GCN is the primary distributer of detections and follow-up observations of Gamma-ray Bursts (GRBs), gravitational wave compact binary mergers, and high-energy neutrinos.

The new GCN is the next generation transient alert system built upon the legacy of the Gamma-ray Coordinates Network (referred to throughout as GCN-Classic, formerly BACODINE/TAN), updated to use the latest technologies for transient distribution being utilized by the optical transient community and providing a robust reliable cloud-based system.

## The GCN system distributes:

- **Notices:** Locations of GRBs and other Transients (e.g. gravitational waves, neutrinos, AGN flares) detected by space- and ground-based observatories (most in realtime while the source is still bursting and others are that delayed due to communications and processing).
- **Circulars:** Reports of follow-up observations made by ground-based and space-based optical, radio, X-ray, gamma-ray, TeV, and other particle observers.

These two functions provide a one-stop shopping network for follow-up sites and GRB and transient researchers. The new GCN system uses the [Apache Kafka](https://kafka.apache.org) protocol for distributing Notices, and is operated within the Commercial managed Kafka system, [Confluent Platform](https://www.confluent.io), running on Amazon Web Services. The Kafka systems utilizes Hopclient, developed by SCiMMA, and ...

## The GCN system has three ways to access the data

| System                 | Transmission Protocols | Data Formats                   |
| ---------------------- | ---------------------- | ------------------------------ |
| GCN-Classic            | Email, Socket          | Text, 160 byte Binary, VOevent |
| GCN-Classic-over-Kafka | Kafka                  | Text, 160 byte Binary, VOevent |
| GCN                    | Kafka                  | AVRO/JSON                      |

### GCN-Classic

Legacy system run on premises at NASA/GSFC utilizing bespoke protocols for ingestion and distribution of transient data. New web application to modify your configurations coming soon. The GCN-Classic system is being maintained until the community has fully transitioned to the new GCN

### GCN-Classic-over-Kafka

Transition system serving legacy GCN-Classic formats via Kafka.

### GCN

New system serving data in AVRO schema, which are JSON records. These schema have been formatted to provide uniformity between instruments wherever possible making it easier to compare records across missions. GCN provides both instrument specific topics as well as combined event based topics.

## Other Components of the New GCN

### GRB Name Server

### GCN Viewer
