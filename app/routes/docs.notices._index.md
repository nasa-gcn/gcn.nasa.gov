# GCN Notices

Notices are real-time, machine-readable alerts that are submitted by participating facilities and redistributed publicly.

GCN Classic and the new GCN offer multiple file formats and protocols for receiving notices. We strongly encourage use of the new GCN, as we gradually migrate all services, and new notice types will only be available via the new GCN.

| Protocol                      | File Format                              | System      | Subscription        | Status                                 |
| ----------------------------- | ---------------------------------------- | ----------- | ------------------- | -------------------------------------- |
| Kafka                         | 160-byte binary, VOEvent XML, Text, JSON | New GCN     | Self Service        | Preferred                              |
| Email (no-reply@gcn.nasa.gov) | 160-byte binary, VOEvent XML, Text       | New GCN     | Self Service        | Preferred                              |
| Socket                        | 160-byte binary                          | GCN Classic | Manual              | Active but recommend Kafka instead     |
| VOEvent                       | VOEvent XML                              | GCN Classic | Manual or Anonymous | Active but recommend Kafka instead     |
| Email (capella2)              | Text                                     | GCN Classic | Manual              | Active but recommend email via new GCN |
| SMS                           | Short Text                               | GCN Classic | Manual              | Active (future new GCN enhancement)    |

## Distribution Protocols

The new GCN is built upon the Kafka data streaming protocol. We encourage the use of Kafka for automated pipelines, robotic telescopes, and users who wish to stream the notices in real time. GCN also provides self-managed subscriptions to any of the legacy notice formats (binary, VOEvent XML, text) via email. All new notice types are available only via the new GCN in JSON formats over Kafka. Human-readable text versions of the JSON formats are in development.

GCN Classic will continue to maintain distribution of all legacy notice types via manual subscriptions to socket connections, VOEvent, and email, until at least the end of the O4 LVK observing run. However, we strongly encourage new sites to utilize the subscription methods of the new GCN, and for users to transition to the new system.

## File Formats

JSON (JavaScript Object Notation) is a file that stores simple data structures and objects. They are text based, human readable, and easily parseable.

VOEvent is an XML-based text format generalized for astronomical transients. It was developed by the International Virtual Observatory Alliance ([IVOA](https://ivoa.net)). VOEvent format Notices are available via the [GCN VOEvent brokers](https://gcn.gsfc.nasa.gov/gcn/voevent.html) or preferably via [Kafka](docs/client).

Binary is a custom 160-byte packet protocol developed for [GCN Classic socket connections](https://gcn.gsfc.nasa.gov/gcn/tech_describe.html). The socket service remains active, but we encourage users to receive these messages via Kafka.

Text format is a human-readable message developed for GCN Classic and distributed via email.

### Schema

Notices have fixed pre-defined schema.

#### GCN Classic Schema

GCN Classic binary and text schema are bespoke for each notice type with some commonality across missions. VOEvent schema are defined from the [IVOA standard](https://wiki.ivoa.net/twiki/bin/view/IVOA/IvoaVOEvent).

#### Unified Schema

The GCN team has created new JSON format custom schema designed specifically for the types of transients reported by current and upcoming GCN producer missions. The core schema are designed to be building blocks containing most of the common fields used by the majority of instruments. Additional parameters can be added, but we encourage only including fields useful for informing consumers about the properties of the event useful for alerting and follow-up observations. They should not include fields that can easily be calculated using common software packages (e.g. coordinate transformations, distance from Sun or Moon).

More details on schema are available on the individual [Mission](/missions) pages and in the Schema Browser.

## For more details on how to use GCN Notices, see:

- [Subscribing](notices/subscribing) to receive GCN Notices by Kafka or Email
- [Producers](producers) for setting up new notice types
- [Archive](circulars/archive) for how to search for and browse GCN Notices
