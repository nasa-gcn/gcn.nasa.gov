---
handle:
  breadcrumb: Frequently Asked Questions
---

# Frequently Asked Questions

## What is Kafka?

According to the [Apache Kafka](https://kafka.apache.org) web site, “Apache Kafka is an open-source distributed event streaming platform used by thousands of companies for high-performance data pipelines, streaming analytics, data integration, and mission-critical applications.”

In recent years, Apache Kafka has seen wide adoption by the astronomy community, notably by the [Vera C. Rubin Observatory](https://www.lsst.org). GCN operates a highly available cluster of Kafka brokers in the cloud on Amazon Web Services that distributes GCN Notices to users.

The Kafka platform itself does not care about the format of the records. However, [Avro](https://avro.apache.org) and [JSON](https://www.json.org) are very common formats for Kafka records because of a rich ecosystem of open-source and commercial tools for them built on Kafka (for example: [Kafka Streams](https://kafka.apache.org/documentation/streams/), [ksqldb](https://ksqldb.io), [Kafka Connect](https://www.confluent.io/product/confluent-connectors/)). [The Vera C. Rubin Observatory's alert system](https://dmtn-093.lsst.io) uses Avro over the [Confluent Wire Format](https://docs.confluent.io/platform/current/schema-registry/serdes-develop/index.html). For these reaons, GCN is developing a unified schema for communicating Notices in Avro or JSON records over the Confluent Wire Format (see [roadmap](/docs/roadmap)).

## How do I start receving GCN notices via Kafka?

See [Kafka Client Setup](/docs/client).

## What ports do I need to open in order to receive or send GCN notices with Kafka?

Clients connecting to GCN only need to be able to make _outbound_ (egress) TCP connections. The client connects to the following hosts and ports.

<table className="usa-table">
  <thead>
    <tr>
      <th>Direction</th>
      <th>Protocol</th>
      <th>Purpose</th>
      <th>Port</th>
      <th>Host</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowSpan="5">outbound</td>
      <td rowSpan="5">TCP</td>
      <td>HTTPS</td>
      <td>443</td>
      <td>auth.gcn.nasa.gov</td>
    </tr>
    <tr>
      <td rowSpan="4">Kafka</td>
      <td rowSpan="4">9092</td>
      <td>kafka.gcn.nasa.gov</td>
    </tr>
    <tr>
      <td>kafka1.gcn.nasa.gov</td>
    </tr>
    <tr>
      <td>kafka2.gcn.nasa.gov</td>
    </tr>
    <tr>
      <td>kafka3.gcn.nasa.gov</td>
    </tr>
  </tbody>
</table>

## What does the warning `Subscribed topic not available: gcn.classic.text.AGILE_GRB_GROUND: Broker: Unknown topic or partition'` mean?

This warning means that there have not been any recent alerts on that topic.

## How do I receive GCN Notices via email from GCN Classic over Kafka?

To get started, [sign in or sign up](https://gcn.nasa.gov/login) and then select 'Email Notifications' from account dropdown menu. See also [GCN Circular 32517](https://gcn.gsfc.nasa.gov/gcn3/32517.gcn3).

## Why do GCN Ciculars that I submit by email appear to be double spaced?

Some email clients in some configurations are known to add extra line breaks to emails. When you are preparing to submit a GCN Circular by email, you should always make sure that you are composing a plain text message. See the following instructions for various mail clients:

- [Apple Mail](https://support.apple.com/guide/mail/use-plain-or-rich-text-in-emails-mlhlp1009/mac)
- [Microsoft Outlook for Mac](https://it.cornell.edu/outlook2016mac/choose-plain-text-or-formatted-text-outlook-mac)
- [Microsoft Outlook for Windows](https://support.microsoft.com/en-us/office/change-the-message-format-to-html-rich-text-format-or-plain-text-338a389d-11da-47fe-b693-cf41f792fefa)

Note that it used to be common practice for Circulars submitters to add line breaks to manually wrap long paragraphs in GCN Circulars. This practice is no longer recommended in the [GCN Circulars style guide](/circulars/styleguide).
