/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import { paginateScan } from '@aws-sdk/lib-dynamodb'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { Kafka } from 'gcn-kafka'
import type { AclEntry } from 'kafkajs'
import {
  AclOperationTypes,
  AclPermissionTypes,
  AclResourceTypes,
  ResourcePatternTypes,
} from 'kafkajs'
import memoizee from 'memoizee'

import { domain, getEnvOrDieInProduction } from './env.server'
import type { User } from '~/routes/_auth/user.server'

const client_id = getEnvOrDieInProduction('KAFKA_CLIENT_ID') ?? ''
const client_secret = getEnvOrDieInProduction('KAFKA_CLIENT_SECRET')
const kafka = new Kafka({
  client_id,
  client_secret,
  domain,
})

export let send: (topic: string, value: string) => Promise<void>

// FIXME: A single AWS Lambda execution environment can handle multiple
// invocations; AWS sends the runtime SIGTERM when it is time to shut down.
// However, @architect/sandbox does not properly simulate this behavior when it
// invokes a Lambda; rather than returning control after the Lambda handler
// returns, @architect/sandbox hangs until the Node.js runtime process
// terminates, or a timeout is reached, and then apparently kills the runtime
// process ungracefully. This is a problem if there are resources that are
// initialized during the invocation that have unsettled promises in the
// background that keep the Node.js runtime's event loop going.
//
// On AWS Lambda, we leave the Kafka connection open so that it is reused over
// multiple invocations and we register a beforeExit event handler to close it
// when the runtime is gracefully shutting down. However, until the above issue
// is fixed in @architect/sandbox, we need a separate code path for local
// testing.
if (process.env.ARC_SANDBOX) {
  send = async (topic, value) => {
    const producer = kafka.producer()
    await producer.connect()
    try {
      await producer.send({ topic, messages: [{ value }] })
    } finally {
      await producer.disconnect()
    }
  }
} else {
  // FIXME: remove memoizee and use top-level await once we switch to ESM builds.
  const getProducer = memoizee(
    async () => {
      const producer = kafka.producer()
      await producer.connect()
      ;['SIGINT', 'SIGTERM'].forEach((event) =>
        process.once(event, async () => {
          console.log('Disconnecting from Kafka')
          await producer.disconnect()
          console.log('Disconnected from Kafka')
        })
      )
      return producer
    },
    { promise: true }
  )

  send = async (topic, value) => {
    const producer = await getProducer()
    await producer.send({ topic, messages: [{ value }] })
  }
}

export type KafkaACL = {
  topicName: string
  userClientType: UserClientType
  cognitoGroup: string
  prefixed: boolean
  permissionType: number
}

export type UserClientType = 'producer' | 'consumer'

export const adminGroup = 'gcn.nasa.gov/gcn-admin'

const consumerOperations = [AclOperationTypes.READ, AclOperationTypes.DESCRIBE]
const producerOperations = [
  AclOperationTypes.CREATE,
  AclOperationTypes.WRITE,
  AclOperationTypes.DESCRIBE,
]

const admin_client_id = getEnvOrDieInProduction('KAFKA_ADMIN_CLIENT_ID') ?? ''
const admin_client_secret = getEnvOrDieInProduction('KAFKA_ADMIN_CLIENT_SECRET')
const adminKafka = new Kafka({
  client_id: admin_client_id,
  client_secret: admin_client_secret,
  domain,
})

function validateUser(user: User) {
  if (!user.groups.includes(adminGroup))
    throw new Response(null, { status: 403 })
}

export async function createKafkaACL(user: User, acl: KafkaACL) {
  validateUser(user)
  // Save to db
  const db = await tables()
  await db.kafka_acls.put(acl)

  // Add to Kafka
  const adminClient = adminKafka.admin()
  await adminClient.connect()
  await adminClient.createTopics({
    topics: [
      {
        topic: acl.topicName,
      },
    ],
  })
  const acls =
    acl.userClientType == 'producer'
      ? createProducerAcls(acl)
      : createConsumerAcls(acl)
  await adminClient.createAcls({ acl: acls })
  await adminClient.disconnect()
}

export async function getKafkaACLByTopicName(user: User, topicName: string) {
  validateUser(user)
  const db = await tables()
  return (await db.kafka_acls.get({ topicName })) as KafkaACL
}

export async function getKafkaACLsFromDynamoDB(user: User, filter?: string) {
  validateUser(user)
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('kafka_acls')
  const pages = paginateScan(
    { client },
    {
      TableName,
      FilterExpression: filter
        ? 'contains(topicName, :filter) OR contains(cognitoGroup, :filter)'
        : undefined,
      ExpressionAttributeValues: filter
        ? {
            ':filter': filter,
          }
        : undefined,
    }
  )

  const acls: KafkaACL[] = []
  for await (const page of pages) {
    const newACL = page.Items as KafkaACL[]
    if (newACL) acls.push(...newACL)
  }
  return acls
}

export async function getKafkaTopicsForUser(user: User) {
  validateUser(user)
  const userGroups = user.groups.filter((x) =>
    x.startsWith('gcn.nasa.gov/kafka-')
  )
  const db = await tables()
  const items = (
    await Promise.all([
      ...userGroups.map((cognitoGroup) =>
        db.kafka_acls.query({
          IndexName: 'aclsByGroup',
          KeyConditionExpression:
            'cognitoGroup = :group AND permissionType = :permission',
          ProjectionExpression: 'topicName',
          ExpressionAttributeValues: {
            ':group': cognitoGroup,
            ':permission': 'consumer',
          },
        })
      ),
    ])
  )
    .filter((x) => x.Count && x.Count > 0)
    .flatMap((x) => x.Items)
    .map((x) => x.topicName)

  return items
}
export async function getAclsFromBrokers() {
  const adminClient = adminKafka.admin()
  await adminClient.connect()
  const acls = await adminClient.describeAcls({
    resourceType: AclResourceTypes.TOPIC,
    host: '*',
    permissionType: AclPermissionTypes.ANY,
    operation: AclOperationTypes.ANY,
    resourcePatternType: ResourcePatternTypes.ANY,
  })
  await adminClient.disconnect()
  const results: KafkaACL[] = []
  for (const item of acls.resources) {
    console.log('Item:', item)
    const topicName = item.resourceName

    const prefixed = item.resourcePatternType === ResourcePatternTypes.PREFIXED
    results.push(
      ...item.acls
        .filter((acl) => acl.operation !== AclOperationTypes.DESCRIBE)
        .map((acl) => {
          const principal = acl.principal.split('-')
          return {
            topicName,
            prefixed,
            permissionType: acl.permissionType,
            cognitoGroup: acl.principal.replace('User:', ''),
            userClientType: principal[principal.length - 1] as UserClientType,
          }
        })
    )
  }

  return results
}

export async function deleteKafkaACL(user: User, acl: KafkaACL) {
  validateUser(user)
  const db = await tables()
  await db.kafka_acls.delete({
    topicName: acl.topicName,
    cognitoGroup: acl.cognitoGroup,
  })

  const acls =
    acl.userClientType == 'producer'
      ? createProducerAcls(acl)
      : createConsumerAcls(acl)

  const adminClient = adminKafka.admin()
  await adminClient.connect()
  await adminClient.deleteAcls({ filters: acls })
  await adminClient.disconnect()
}

function createProducerAcls(acl: KafkaACL): AclEntry[] {
  // Create, Write, and Describe operations
  return mapAclAndOperations(acl, producerOperations)
}

function createConsumerAcls(acl: KafkaACL): AclEntry[] {
  // Read and Describe operations
  return mapAclAndOperations(acl, consumerOperations)
}

function mapAclAndOperations(acl: KafkaACL, operations: AclOperationTypes[]) {
  return operations.map((operation) => {
    return {
      resourceType: AclResourceTypes.TOPIC,
      resourceName: acl.topicName,
      resourcePatternType: acl.prefixed
        ? ResourcePatternTypes.PREFIXED
        : ResourcePatternTypes.LITERAL,
      principal: `User:${acl.cognitoGroup}`,
      host: '*',
      operation,
      permissionType: acl.permissionType,
    }
  })
}

export async function updateBrokersFromDb(user: User) {
  const dbDefinedAcls = await getKafkaACLsFromDynamoDB(user)
  const mappedAcls = dbDefinedAcls.flatMap((x) =>
    x.userClientType === 'producer'
      ? createProducerAcls(x)
      : createConsumerAcls(x)
  )

  const adminClient = adminKafka.admin()
  await adminClient.connect()
  await adminClient.createAcls({ acl: mappedAcls })
  await adminClient.disconnect()
}

export async function updateDbFromBrokers(user: User) {
  const kafkaDefinedAcls = await getAclsFromBrokers()
  const db = await tables()
  await Promise.all([
    ...kafkaDefinedAcls.map((acl) => db.kafka_acls.put(acl)),
    db.kafka_acl_log.put({
      partitionKey: 1,
      syncedOn: Date.now(),
      syncedBy: user.email,
    }),
  ])
}

type KafkaAclSyncLog = {
  partitionKey: number
  syncedOn: number
  syncedBy: string
}

export async function getLastSyncDate(): Promise<KafkaAclSyncLog> {
  const db = await tables()
  return (
    await db.kafka_acl_log.query({
      KeyConditionExpression: 'partitionKey = :1',
      ExpressionAttributeValues: { ':1': 1 },
      ScanIndexForward: false,
      Limit: 1,
    })
  ).Items.pop() as KafkaAclSyncLog
}
