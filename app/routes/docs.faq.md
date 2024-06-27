---
handle:
  breadcrumb: Frequently Asked Questions
---

# Frequently Asked Questions

## Kafka

### What is Kafka?

According to the [Apache Kafka](https://kafka.apache.org) web site, “Apache Kafka is an open-source distributed event streaming platform used by thousands of companies for high-performance data pipelines, streaming analytics, data integration, and mission-critical applications.”

In recent years, Apache Kafka has seen wide adoption by the astronomy community, notably by the [Vera C. Rubin Observatory](https://www.lsst.org). GCN operates a highly available cluster of Kafka brokers in the cloud on Amazon Web Services that distributes GCN Notices to users.

The Kafka platform itself does not care about the format of the records. However, [Avro](https://avro.apache.org) and [JSON](https://www.json.org) are very common formats for Kafka records because of a rich ecosystem of open-source and commercial tools for them built on Kafka (for example: [Kafka Streams](https://kafka.apache.org/documentation/streams/), [ksqldb](https://ksqldb.io), [Kafka Connect](https://www.confluent.io/product/confluent-connectors/)). [The Vera C. Rubin Observatory's alert system](https://dmtn-093.lsst.io) uses Avro over the [Confluent Wire Format](https://docs.confluent.io/platform/current/schema-registry/serdes-develop/index.html). GCN has developed a [unified schema for communicating Notices as JSON records](/docs/schema).

### How do I start receiving GCN notices via Kafka?

See [Kafka Client Setup](/docs/client).

### What ports do I need to open in order to receive or send GCN notices with Kafka?

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

### What does the warning `Subscribed topic not available: gcn.classic.text.AGILE_GRB_GROUND: Broker: Unknown topic or partition'` mean?

This warning means that there have not been any recent alerts on that topic.

### As a GCN Notice producer, what is the largest message that I can send over Kafka?

The GCN Kafka brokers will accept messages up to about 4 MiB (4,194,304 bytes) in size. Please [contact us](/contact) if your mission requires larger messages.

Note that if your messages are 1 MB (1,000,000 bytes) or more in size, then you will need to set the `message.max.bytes` [client configuration property](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md) when you create your Kafka producer. For example, in Python you would set that property as follows:

```python
from gcn_kafka import Producer
producer = Producer(
    client_id='fill me in',
    client_secret='fill me in',
    **{'message.max.bytes': 4194304})
```

See GitHub issue [confluentinc/librdkafka#3125](https://github.com/confluentinc/librdkafka/issues/3125).

### How do I receive GCN Notices via email from GCN Classic over Kafka?

To get started, [sign in or sign up](https://gcn.nasa.gov/login) and then select 'Email Notifications' from account dropdown menu. See also [GCN Circular 32517](/circulars/32517).

## Circulars

### Why do GCN Circulars that I submit by email appear to be double spaced?

Some email clients in some configurations are known to add extra line breaks to emails. When you are preparing to submit a GCN Circular by email, you should always make sure that you are composing a plain text message. See the following instructions for various mail clients:

- [Apple Mail](https://support.apple.com/guide/mail/use-plain-or-rich-text-in-emails-mlhlp1009/mac)
- [Microsoft Outlook for Mac](https://it.cornell.edu/outlook2016mac/choose-plain-text-or-formatted-text-outlook-mac)
- [Microsoft Outlook for Windows](https://support.microsoft.com/en-us/office/change-the-message-format-to-html-rich-text-format-or-plain-text-338a389d-11da-47fe-b693-cf41f792fefa)

Note that it used to be common practice for Circulars submitters to add line breaks to manually wrap long paragraphs in GCN Circulars. This practice is no longer recommended in the [GCN Circulars style guide](circulars/styleguide).

## Accounts

### How do I sign in as a legacy GCN Classic Circulars user?

If you had a GCN Circulars account prior to April 17, 2023, your account was migrated to the new GCN. Your receiving preferences, submitting permission, name and affiliation will be associated with your account as soon as you sign in for the first time. If you choose to sign in via email address and password, tap "Sign up" not "Forgot your password?".

## Operations

### Does GCN keep working during a U.S. federal government shutdown?

**Yes.** During a U.S. federal government shutdown, all GCN services (GCN Circulars, GCN Notices, Kafka cluster, the web site) remain fully operational. However, there may be the following minor impacts to GCN users:

- Responses to questions and requests through the [GCN help desk](/contact) may be delayed.
- Issues and pull requests on https://github.com/nasa-gcn repositories may not be promptly reviewed.
- There will be no [redeployments](/docs/contributing/deployment) of the GCN web site except to address emergencies.
