import { tables } from '@architect/functions'
import { SSMClient, SendCommandCommand } from '@aws-sdk/client-ssm'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { paginateScan } from '@aws-sdk/lib-dynamodb'

import type { User } from '~/routes/_gcn._auth/user.server'

const ssm = new SSMClient()

export const adminGroup = 'gcn.nasa.gov/admin'

type TopicAssociation = {
  commandId: string
  sub: string
  consumerGroup: string
  producerGroup: string
  topic: string
}

/**
 * Checks that the current user has appropriate permissions,
 * then runs the command Document to set consumer and
 * producer permissions for a new Kafka topic.
 *
 * Sets a PREFIXED and non PREFIXED version
 *
 * @param consumerGroup Should follow the format: `gcn.nasa.gov/kafka-{mission}-consumer`
 * @param producerGroup Should follow the format: `gcn.nasa.gov/kafka-{mission}-producer`
 * @param topic Should follow current format as described in producer code: `gcn.notices.{mission}`
 * @param user
 * @returns Command Id
 */
export async function addACL(
  consumerGroup: string,
  producerGroup: string,
  topic: string,
  user: User
) {
  if (!user.groups.includes(adminGroup))
    throw new Response(null, { status: 403 })

  const command = new SendCommandCommand({
    DocumentName: 'KafkaACLUpdate',
    Parameters: {
      ConsumerGroup: [consumerGroup],
      ProducerGroup: [producerGroup],
      Topic: [topic],
    },
    Targets: [
      {
        Key: 'tag:Name',
        Values: [
          'GcnKafka-Instance3',
          'GcnKafka-Instance2',
          'GcnKafka-Instance1',
        ],
      },
    ],
  })
  const response = await ssm.send(command)

  if (!response.Command?.CommandId) throw new Response(null, { status: 500 })
  const db = await tables()
  await db.kafka_acls.put({
    commandId: response.Command?.CommandId,
    sub: user.sub,
    consumerGroup,
    producerGroup,
    topic,
  })

  return response.Command.CommandId
}

export async function getTopics() {
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('kafka_acls')
  const pages = paginateScan({ client }, { TableName })

  let result: TopicAssociation[] = []
  for await (const page of pages) {
    if (page.Items) {
      const items = page.Items as TopicAssociation[]
      result = result.concat(items)
    }
  }
  return result
}
