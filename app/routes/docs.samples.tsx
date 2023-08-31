import { Link } from '@trussworks/react-uswds'
import dedent from 'ts-dedent'

import { Highlight } from '~/components/Highlight'

export default function Samples() {
  return (
    <>
      <h1>Code Samples</h1>
      <div>
        <p>
          We have collected a short list of functions and examples that may be
          useful when working with GCN Notices in your code. These include
          conversions from text/VOEvent alert formats to json and xml {'('}for
          VOEvent alerts{')'} and examples for how to save alerts in these
          formats.
        </p>
        <p>
          For more examples, or to contribute your own ideas, see our{' '}
          <Link href="https://github.com/nasa-gcn/utility-samples">
            Utility Sample
          </Link>{' '}
          and{' '}
          <Link href="https://github.com/nasa-gcn/gcn-kafka-python">
            gcn-kafka-python
          </Link>{' '}
          repositories.
        </p>
        <h2>Parsing</h2>
        <p>
          Within your consumer loop, the following functions can be used to
          convert the content of <code>message.value()</code> into other data
          types.
        </p>
        <p>
          <code>xmltodict</code> is not a standard python package, it must be
          installed with pip:
        </p>
        <Highlight language="sh" code="pip install xmltodict" />
        <Highlight
          code={dedent`
      import email
      import xml.etree.ElementTree as ET
      import xmltodict
      
      
      def parse_text_alert_to_dict(message_value):
          return dict(email.message_from_bytes(message_value))
      
      
      def parse_voevent_alert_to_xml_root(message_value):
          return ET.fromstring(message_value)
      
              
      def parse_voevent_alert_to_dict(message_value):
          return xmltodict.parse(message_value)
      
      `}
          language="py"
        />
        <h2>Saving</h2>
        <p>
          Once parsed, the following can be used to save the data to a local
          file.
        </p>
        <Highlight
          code={dedent`
      import json
      
      
      def save_text_alert(message_value):
          # Save incoming event message as text file:
          with open('path/to/your/file.txt', 'w') as file:
              file.write(message_value.decode())
          
          # Save incoming event message as json file:
          alert_data = parse_text_alert_to_dict(message_value)
          with open("path/to/your/file.json", "wb") as file:
              file.write(json.dumps(alert_data))
              
      
      def save_voevent_alert(message_value):
         # Save incoming vo event as a json file
          dataDict = parse_voevent_alert_to_dict(message_value)
          with open('path/to/your/file.json', "w") as file:
              file.write(json.dumps(dataDict))
          
          # Or save incoming vo event as xml
          with open('path/to/your/file.xml', "w") as file:
              file.write(message_value.decode())
        `}
          language="py"
        />

        <h2>Keep track of the last read message when restarting a client</h2>
        <p>
          A key feature of kafka consumer clients is the ability to perform
          persistent tracking of which messages have been read. This allows
          clients to recover missed messages after a restart by beginning at the
          earliest unread message rather than the next available message from
          the stream. In order to enable this feature, you will need to set a
          client Group ID using the configuration dictionary argument for the
          Consumer class as well as change the auto offset reset option to the
          'earliest' setting. Once this is done, every new client with the given
          Group ID will begin reading the specified topic at the earliest unread
          message. When doing this, it is recommended to turn OFF the auto
          commit feature because it can lose track of the last read message if
          the client crashes before the auto commit interval (5 seconds by
          default) occurs. Manually committing messages (i.e. storing the state
          of the last read message) once they are read is the most robust method
          for tracking the last read message.
        </p>
        <Highlight
          code={dedent`
        from gcn_kafka import Consumer

        config = {'group.id': 'my group name',
                  'auto.offset.reset': 'earliest',
                  'enable.auto.commit': False}

        consumer = Consumer(config=config,
                            client_id='fill me in',
                            client_secret='fill me in',
                            domain='gcn.nasa.gov')

        topics = ['gcn.classic.voevent.FERMI_GBM_SUBTHRESH']
        consumer.subscribe(topics)

        while True:
            for message in consumer.consume(timeout=1):
                print(message.value())
                consumer.commit(message)
        `}
          language="py"
        />

        <h2>
          Read messages beginning at the earliest available messages for a given
          stream
        </h2>
        <p>
          You can begin reading a given topic stream from the earliest message
          that is present in the stream buffer by setting the Group ID to an
          empty string and applying the 'earliest' setting for the auto offset
          reset option in the configuration dictionary argument for the Consumer
          class. This feature allows the user to scan for older messages for
          testing purposes or to recover messages that may have been missed due
          to a crash or network outage. Just keep in mind that the stream
          buffers are finite in size. They currently hold messages from the past
          few days.
        </p>
        <Highlight
          code={dedent`
          from gcn_kafka import Consumer

          config = {'auto.offset.reset': 'earliest'}
          
          consumer = Consumer(config=config,
                              client_id='fill me in',
                              client_secret='fill me in',
                              domain='gcn.nasa.gov')
          
          topics = ['gcn.classic.voevent.INTEGRAL_SPIACS']
          consumer.subscribe(topics)
          
          while True:
              for message in consumer.consume(timeout=1):
                  print(message.value())
          `}
          language="py"
        />

        <h2>Search for messages occurring within a given date range</h2>
        <p>
          To search for messages in a given date range, you can use the{' '}
          <code>offsets_for_times()</code> function from the Consumer class to
          get the message offsets for the desired date range. You can then
          assign the starting offset to the Consumer and read the desired number
          of messages. When doing so, keep in mind that the stream buffers are
          finite in size. It is not possible to recover messages prior to the
          start of the stream buffer. The GCN stream buffers are currently set
          to hold messages from the past few days.
        </p>
        <Highlight
          code={dedent`
          import datetime
          from gcn_kafka import Consumer
          from confluent_kafka import TopicPartition
          
          consumer = Consumer(client_id='fill me in',
                              client_secret='fill me in',
                              domain='gcn.nasa.gov')
          
          # get messages occurring 3 days ago
          timestamp1 = int((datetime.datetime.now() - datetime.timedelta(days=3)).timestamp() * 1000)
          timestamp2 = timestamp1 + 86400000 # +1 day
          
          topic = 'gcn.classic.voevent.INTEGRAL_SPIACS'
          start = consumer.offsets_for_times(
              [TopicPartition(topic, 0, timestamp1)])
          end = consumer.offsets_for_times(
              [TopicPartition(topic, 0, timestamp2)])
          
          consumer.assign(start)
          for message in consumer.consume(end[0].offset - start[0].offset, timeout=1):
              print(message.value())
          `}
          language="py"
        />
      </div>
    </>
  )
}
