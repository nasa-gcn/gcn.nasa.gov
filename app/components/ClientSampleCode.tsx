/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from '@trussworks/react-uswds'
import { dedent } from 'ts-dedent'

import { Highlight } from './Highlight'
import { useDomain } from '~/root'

export function ClientSampleCode({
  clientName,
  clientId = 'fill me in',
  clientSecret = 'fill me in',
  listTopics = true,
  topics = [
    'gcn.classic.text.FERMI_GBM_FIN_POS',
    'gcn.classic.text.LVC_INITIAL',
  ],
  language,
}: {
  clientName?: string
  clientId?: string
  clientSecret?: string
  listTopics?: boolean
  topics?: string[]
  language: 'py' | 'mjs' | 'cjs' | 'c' | 'cs' | 'java'
}) {
  const domain = useDomain()

  switch (language) {
    case 'py':
      return (
        <>
          <p className="usa-paragraph">
            Open a terminal and run this command to install with{' '}
            <Link
              className="usa-link"
              rel="external noopener"
              target="_blank"
              href="https://pip.pypa.io/"
            >
              pip
            </Link>
            :
          </p>
          <Highlight language="sh" code="pip install gcn-kafka" />
          <p className="usa-paragraph">
            or this command to install with with{' '}
            <Link
              className="usa-link"
              rel="external noopener"
              target="_blank"
              href="https://docs.conda.io/"
            >
              conda
            </Link>
            :
          </p>
          <Highlight
            language="sh"
            code="conda install -c conda-forge gcn-kafka"
          />
          <p className="usa-paragraph">
            Save the Python code below to a file called <code>example.py</code>:
          </p>
          <Highlight
            language={language}
            filename={`example.${language}`}
            code={dedent(`
            from gcn_kafka import Consumer

            # Connect as a consumer${
              clientName ? ` (client "${clientName}")` : ''
            }
            # Warning: don't share the client secret with others.
            consumer = Consumer(client_id='${clientId}',
                                client_secret='${clientSecret}'${
                                  domain
                                    ? `,
                                domain='${domain}'`
                                    : ''
                                })
            ${
              listTopics
                ? `
            # List all topics
            print(consumer.list_topics().topics)
            `
                : ''
            }
            # Subscribe to topics and receive alerts
            consumer.subscribe([${topics.map((topic) => `'${topic}'`).join(`,
                                `)}])
            while True:
                for message in consumer.consume(timeout=1):
                    if message.error():
                        print(message.error())
                        continue
                    # Print the topic and message ID
                    print(f'topic={message.topic()}, offset={message.offset()}')
                    value = message.value()
                    print(value)

            `)}
          />
          <p className="usa-paragraph">
            Run the code by typing this command in the terminal:
          </p>
          <Highlight language="sh" code="python example.py" />
        </>
      )
    case 'mjs':
      return (
        <>
          <p className="usa-paragraph">
            Open a terminal and run this command to install with{' '}
            <Link
              className="usa-link"
              rel="external noopener"
              target="_blank"
              href="https://www.npmjs.com"
            >
              npm
            </Link>
            :
          </p>
          <Highlight language="sh" code="npm install gcn-kafka" />
          <p className="usa-paragraph">
            Save the JavaScript code below to a file called{' '}
            <code>example.mjs</code>:
          </p>
          <Highlight
            language={language}
            filename={`example.${language}`}
            code={dedent(`
            import { Kafka } from 'gcn-kafka'

            // Create a client.
            // Warning: don't share the client secret with others.
            const kafka = new Kafka({
              client_id: '${clientId}',
              client_secret: '${clientSecret}',${
                domain
                  ? `
              domain: '${domain}',`
                  : ''
              }
            })
            ${
              listTopics
                ? `
            // List topics
            const admin = kafka.admin()
            const topics = await admin.listTopics()
            console.log(topics)
            `
                : ''
            }
            // Subscribe to topics and receive alerts
            const consumer = kafka.consumer()
            try {
              await consumer.subscribe({
                topics: [${topics
                  .map(
                    (topic) => `
                    '${topic}',`
                  )
                  .join('')}
                ],
              })
            } catch (error) {
              if (error.type === 'TOPIC_AUTHORIZATION_FAILED')
              {
                console.warn('Not all subscribed topics are available')
              } else {
                throw error
              }
            }

            await consumer.run({
              eachMessage: async (payload) => {
                const value = payload.message.value
                console.log(\`topic=\${payload.topic}, offset=\${payload.message.offset}\`)
                console.log(value?.toString())
              },
            })

            `)}
          />
          <p className="usa-paragraph">
            Run the code by typing this command in the terminal:
          </p>
          <Highlight language="sh" code="node example.mjs" />
        </>
      )
    case 'cjs':
      return (
        <>
          <p className="usa-paragraph">
            Open a terminal and run this command to install with{' '}
            <Link
              className="usa-link"
              rel="external noopener"
              target="_blank"
              href="https://www.npmjs.com"
            >
              npm
            </Link>
            :
          </p>
          <Highlight language="sh" code="npm install gcn-kafka" />
          <p className="usa-paragraph">
            Save the JavaScript code below to a file called{' '}
            <code>example.cjs</code>:
          </p>
          <Highlight
            language={language}
            filename={`example.${language}`}
            code={dedent(`
            const { Kafka } = require('gcn-kafka');

            (async () => {
              // Create a client.
              // Warning: don't share the client secret with others.
              const kafka = new Kafka({
                client_id: '${clientId}',
                client_secret: '${clientSecret}',${
                  domain
                    ? `
                domain: '${domain}',`
                    : ''
                }
              })
            ${
              listTopics
                ? `
              // List topics
              const admin = kafka.admin()
              const topics = await admin.listTopics()
              console.log(topics)
              `
                : ''
            }
              // Subscribe to topics and receive alerts
              const consumer = kafka.consumer()
              try {
                await consumer.subscribe({
                  topics: [${topics
                    .map(
                      (topic) => `
                      '${topic}',`
                    )
                    .join('')}
                  ],
                })
              } catch (error) {
                if (error.type === 'TOPIC_AUTHORIZATION_FAILED')
                {
                  console.warn('Not all subscribed topics are available')
                } else {
                  throw error
                }
              }

              await consumer.run({
                eachMessage: async (payload) => {
                  const value = payload.message.value
                  console.log(\`topic=\${payload.topic}, offset=\${payload.message.offset}\`)
                  console.log(value?.toString())
                },
              })
            })()

            `)}
          />
          <p className="usa-paragraph">
            Run the code by typing this command in the terminal:
          </p>
          <Highlight language="sh" code="node example.cjs" />
        </>
      )
    case 'c':
      return (
        <>
          <p className="usa-paragraph">
            First,{' '}
            <Link
              className="usa-link"
              rel="external noopener"
              target="_blank"
              href="https://github.com/edenhill/librdkafka#installation"
            >
              install librdkafka
            </Link>{' '}
            version 2.2.0 or newer. Then, save the C code below to a file called{' '}
            <code>example.c</code>:
          </p>
          <Highlight
            language={language}
            filename={`example.${language}`}
            code={dedent(String.raw`
              #include <inttypes.h>
              #include <openssl/bio.h>
              #include <openssl/evp.h>
              #include <openssl/rand.h>
              #include <librdkafka/rdkafka.h>
              #include <stdio.h>


              int main(int argc, char **argv)
              {
                char errstr[512];
                int err;

                // Generate random group ID
                char rand_bytes[256], group_id[2 * sizeof(rand_bytes)] = {'\0'};
                RAND_bytes(rand_bytes, sizeof(rand_bytes));
                BIO *b64 = BIO_new(BIO_f_base64());
                BIO *mem = BIO_new(BIO_s_mem());
                BIO_set_flags(b64, BIO_FLAGS_BASE64_NO_NL);
                BIO_push(b64, mem);
                BIO_write(b64, rand_bytes, sizeof(rand_bytes) - 1);
                BIO_flush(b64);
                BIO_read(mem, group_id, sizeof(group_id) - 1);
                BIO_free_all(b64);

                char *conf_kv[][2] = {
                  {"bootstrap.servers", "kafka.${domain ?? 'gcn.nasa.gov'}"},
                  {"group.id", group_id},
                  {"sasl.mechanisms", "OAUTHBEARER"},
                  // Warning: don't share the client secret with others.
                  {"sasl.oauthbearer.client.id", "${clientId}"},
                  {"sasl.oauthbearer.client.secret", "${clientSecret}"},
                  {"sasl.oauthbearer.method", "oidc"},
                  {"sasl.oauthbearer.token.endpoint.url", "https://auth.${
                    domain ?? 'gcn.nasa.gov'
                  }/oauth2/token"},
                  {"security.protocol", "sasl_ssl"}
                };

                static const char *topics[] = {
                  ${topics.map((topic) => `"${topic}"`).join(`,
                  `)}
                };

                static const int num_conf_kv = sizeof(conf_kv) / sizeof(*conf_kv);
                static const int num_topics = sizeof(topics) / sizeof(*topics);

                // Assemble configuration
                rd_kafka_conf_t *conf = rd_kafka_conf_new();
                for (int i = 0; i < num_conf_kv; i ++)
                {
                  if (rd_kafka_conf_set(conf, conf_kv[i][0], conf_kv[i][1],
                                        errstr, sizeof(errstr)))
                  {
                    fprintf(stderr, "%s\n", errstr);
                    rd_kafka_conf_destroy(conf);
                    return 1;
                  }
                }

                // Create consumer
                rd_kafka_t *rk = rd_kafka_new(RD_KAFKA_CONSUMER, conf, errstr, sizeof(errstr));
                if (!rk) {
                  fprintf(stderr, "%s\n", errstr);
                  return 1;
                }
                ${
                  listTopics
                    ? String.raw`
                // List topics
                const rd_kafka_metadata_t *metadata;
                err = rd_kafka_metadata(rk, 0, NULL, &metadata, -1);
                if (err) {
                  fprintf(stderr, "%s\n", rd_kafka_err2str(err));
                  rd_kafka_destroy(rk);
                  return 1;
                }
                for (int i = 0; i < metadata->topic_cnt; i ++)
                {
                  printf("%s\n", metadata->topics[i].topic);
                }
                rd_kafka_metadata_destroy(metadata);
                `
                    : ''
                }
                // Subscribe to topics
                rd_kafka_topic_partition_list_t *topics_partitions =
                  rd_kafka_topic_partition_list_new(num_topics);
                for (int i = 0; i < num_topics; i ++)
                  rd_kafka_topic_partition_list_add(topics_partitions, topics[i],
                                                    RD_KAFKA_PARTITION_UA);
                err = rd_kafka_subscribe(rk, topics_partitions);
                rd_kafka_topic_partition_list_destroy(topics_partitions);
                if (err)
                {
                  rd_kafka_destroy(rk);
                  fprintf(stderr, "%s\n", rd_kafka_err2str(err));
                  return 1;
                }

                // Consume messages
                while (1)
                {
                  rd_kafka_message_t *message = rd_kafka_consumer_poll(rk, -1);

                  if (!message)
                  {
                    continue;
                  } else if (message->err == RD_KAFKA_RESP_ERR__PARTITION_EOF) {
                    // Ignore this error; it just means that we are at the end of the stream
                    // and need to wait for more data.
                  } else if (message->err == RD_KAFKA_RESP_ERR_UNKNOWN_TOPIC_OR_PART) {
                    // Unknown topic or partition; print warning and continue.
                    fprintf(stderr, "%s\n", rd_kafka_message_errstr(message));
                  } else if (message->err) {
                    fprintf(stderr, "%s\n", rd_kafka_message_errstr(message));
                    rd_kafka_consumer_close(rk);
                    rd_kafka_destroy(rk);
                    return 1;
                  } else {
                    // We received a message; print its topic and offset.
                    printf(
                      "topic=%s, offset=%" PRId64 "\n",
                      rd_kafka_topic_name(message->rkt),
                      message->offset
                    );
                    // Print the message itself.
                    printf("%.*s\n", message->len, message->payload);
                  }

                  rd_kafka_message_destroy(message);
                }

                rd_kafka_consumer_close(rk);
                rd_kafka_destroy(rk);

                return 0;
              }
            `)}
          />
          <p className="usa-paragraph">
            Compile the code. The command will vary slightly depending on your
            operating system and compiler. For GCC on Linux or macOS, run the
            following command:
          </p>
          <Highlight
            language="sh"
            code="gcc $(pkg-config --cflags libcrypto rdkafka) example.c $(pkg-config --libs libcrypto rdkafka)"
          />
          <p className="usa-paragraph">
            Run the program. On Linux or macOS, run the following command:
          </p>
          <Highlight language="sh" code="./a.out" />
        </>
      )
    case 'cs':
      return (
        <>
          <p className="usa-paragraph">
            In Visual Studio, create a new C# Console App under File {'>'} New{' '}
            {'>'} Project. After the project initializes, right click the
            solution in the Solution Explorer and click Manage NuGet packages
            for solution. Browse for and install Confluent.Kafka. Copy the
            following into your Program.cs file.
          </p>
          <Highlight
            language="cs"
            filename={`example.${language}`}
            code={dedent(String.raw`
            using Confluent.Kafka;


            var config = new ConsumerConfig
            {
              SecurityProtocol = SecurityProtocol.SaslSsl,
              BootstrapServers = "kafka.${domain ?? 'gcn.nasa.gov'}",
              GroupId = Guid.NewGuid().ToString(),
              SaslMechanism = SaslMechanism.OAuthBearer,
              SaslOauthbearerMethod = SaslOauthbearerMethod.Oidc,
              SaslOauthbearerTokenEndpointUrl = "https://auth.${
                domain ?? 'gcn.nasa.gov'
              }/oauth2/token",
              // Warning: don't share the client secret with others
              SaslOauthbearerClientId = "${clientId}",
              SaslOauthbearerClientSecret = "${clientSecret}"
            };

            // Create a client.
            using (var consumer = new ConsumerBuilder<Ignore, string>(config).Build())
            {
              // Subscribe to topics
              consumer.Subscribe(new List<string> {
                ${topics.map((topic) => `"${topic}"`).join(`,
                `)}
              });
          ${
            listTopics
              ? `
              // List all topics
              consumer.Subscription.ForEach(topic => Console.WriteLine(topic));
              `
              : ''
          }
              // Consume messages
              while (true)
              {
                try
                {
                  var consumeResult = consumer.Consume();
                  Console.WriteLine(string.Format("topic={0}, offset={1}",consumeResult.Topic, consumeResult.Offset));
                  Console.WriteLine(consumeResult.Message.Value);
                }
                catch (Exception ex)
                {
                  if (ex.Message.Contains("Subscribed topic not available"))
                  {
                    Console.WriteLine(ex.Message);
                  }
                  else
                  {
                    throw;
                  }
                }
              }
            }

            `)}
          />
          <p className="usa-paragraph">
            Build the solution from the build menu, or Ctrl + Shift + B. The
            resulting executable can be found in the bin folder within the
            project.
          </p>
        </>
      )
    case 'java':
      return (
        <>
          <p className="usa-paragraph">
            The following instructions are for the official Kafka command line
            tools which use Java and come with either{' '}
            <a
              rel="external noopener"
              target="_blank"
              href="https://kafka.apache.org/documentation/#quickstart"
            >
              Apache Kafka
            </a>{' '}
            version 3.4.0 or newer or{' '}
            <a
              rel="external noopener"
              target="_blank"
              href="https://docs.confluent.io/kafka/operations-tools/kafka-tools.html"
            >
              Confluent
            </a>{' '}
            7.4.x or newer. However, they should work with most Java code that
            uses the official Apache Kafka client libraries.
          </p>
          <p className="usa-paragraph">
            Save the configuration below to a file called{' '}
            <code>example.properties</code>:
          </p>
          <Highlight
            language="properties"
            filename="example.properties"
            code={dedent(String.raw`
              security.protocol = SASL_SSL
              sasl.mechanism = OAUTHBEARER
              sasl.login.callback.handler.class = org.apache.kafka.common.security.oauthbearer.OAuthBearerLoginCallbackHandler
              sasl.oauthbearer.token.endpoint.url = https://auth.${
                domain ?? 'gcn.nasa.gov'
              }/oauth2/token
              sasl.jaas.config = org.apache.kafka.common.security.oauthbearer.OAuthBearerLoginModule required \
                clientId="${clientId}" \
                clientSecret="${clientSecret}";
              # Warning: don't share the client secret with others.
            `)}
          />
          <p className="usa-paragraph">Next, open a terminal.</p>
          {listTopics && (
            <>
              <p className="usa-paragraph">
                Run the following command to list available Kafka topics.
              </p>
              <Highlight
                language="sh"
                code={`kafka-topics.sh --bootstrap-server kafka.${
                  domain ?? 'gcn.nasa.gov'
                }:9092 --command-config example.properties --list`}
              />
            </>
          )}
          <p className="usa-paragraph">
            Run the following command to consume Kafka records and print them to
            the console (supports only a single topic at a time).
          </p>
          <Highlight
            language="sh"
            code={`kafka-console-consumer.sh --bootstrap-server kafka.${
              domain ?? 'gcn.nasa.gov'
            }:9092 --consumer.config example.properties --topic ${topics[0]}`}
          />
        </>
      )
  }
}
