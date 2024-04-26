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

import { domain, getEnvOrDie } from './env.server'
import type { User } from '~/routes/_auth/user.server'

const client_id = getEnvOrDie('KAFKA_CLIENT_ID')
const client_secret = getEnvOrDie('KAFKA_CLIENT_SECRET')
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
  permissionType: PermissionType
  group: string
  prefixed: boolean
}

export type PermissionType = 'producer' | 'consumer'

export const adminGroup = 'gcn.nasa.gov/gcn-admin'

const consumerOperations = [AclOperationTypes.READ, AclOperationTypes.DESCRIBE]
const producerOperations = [
  AclOperationTypes.CREATE,
  AclOperationTypes.WRITE,
  AclOperationTypes.DESCRIBE,
]

const admin_client_id = getEnvOrDie('KAFKA_ADMIN_CLIENT_ID')
const admin_client_secret = getEnvOrDie('KAFKA_ADMIN_CLIENT_SECRET')
const adminClient = new Kafka({
  client_id: admin_client_id,
  client_secret: admin_client_secret,
  domain: 'dev.gcn.nasa.gov', // TODO: replace w/ useDomain
}).admin()

function validateUser(user: User) {
  if (!user.groups.includes(adminGroup))
    throw new Response(null, { status: 403 })
}

// Not sure if this is a useful method, but may be helpful if we
// want to verify that our table matches the defined kafka acls
export async function verifyKafkaACL(acl: KafkaACL) {
  const operations =
    acl.permissionType == 'producer' ? producerOperations : consumerOperations

  const promises = operations.map((operation) =>
    adminClient.describeAcls({
      resourceName: acl.topicName,
      resourceType: AclResourceTypes.TOPIC,
      host: '*',
      permissionType: AclPermissionTypes.ALLOW,
      operation,
      resourcePatternType: ResourcePatternTypes.LITERAL,
    })
  )

  const results = await Promise.all(promises)
  console.log(results)
}

export async function createKafkaACL(user: User, acl: KafkaACL) {
  validateUser(user)
  // Save to db
  const db = await tables()
  await db.kafka_acls.put(acl)

  // Add to Kafka
  await adminClient.connect()
  await adminClient.createTopics({
    topics: [
      {
        topic: acl.topicName,
      },
    ],
  })
  const acls =
    acl.permissionType == 'producer'
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

export async function getKafkaACLsFromDynamoDB(user: User) {
  validateUser(user)
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('kafka_acls')
  const pages = paginateScan({ client }, { TableName })
  const acls: KafkaACL[] = []
  for await (const page of pages) {
    const newACL = page.Items as KafkaACL[]
    if (newACL) acls.push(...newACL)
  }
  return acls
}

export async function getAclsFromBrokers() {
  await adminClient.connect()
  const acls = await adminClient.describeAcls({
    resourceType: AclResourceTypes.TOPIC,
    host: '*',
    permissionType: AclPermissionTypes.ALLOW,
    operation: AclOperationTypes.ANY,
    resourcePatternType: ResourcePatternTypes.ANY,
  })
  await adminClient.disconnect()
  const results: KafkaACL[] = []
  for (const item of acls.resources) {
    const topicName = item.resourceName
    const prefixed = item.resourcePatternType === ResourcePatternTypes.PREFIXED
    const producerRules = producerOperations.every((op) =>
      item.acls.map((x) => x.operation).includes(op)
    )
    const producerGroup =
      producerRules &&
      [
        ...new Set(
          item.acls
            .filter((acl) => producerOperations.includes(acl.operation))
            .map((x) => x.principal)
        ),
      ][0]?.replace('User:', '')
    const consumerRules = consumerOperations.every((op) =>
      item.acls.map((x) => x.operation).includes(op)
    )
    const consumerGroup =
      consumerRules &&
      [
        ...new Set(
          item.acls
            .filter((acl) => consumerOperations.includes(acl.operation))
            .map((x) => x.principal)
        ),
      ][0]?.replace('User:', '')
    if (producerRules && producerGroup)
      results.push({
        topicName,
        permissionType: 'producer',
        group: producerGroup,
        prefixed,
      })
    if (consumerRules && consumerGroup)
      results.push({
        topicName,
        permissionType: 'consumer',
        group: consumerGroup,
        prefixed,
      })
  }
  return results
}

export async function deleteKafkaACL(user: User, acl: KafkaACL) {
  validateUser(user)
  const db = await tables()
  await db.kafka_acls.delete({ topicName: acl.topicName, group: acl.group })

  const acls =
    acl.permissionType == 'producer'
      ? createProducerAcls(acl)
      : createConsumerAcls(acl)

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
      principal: `User:${acl.group}`,
      host: '*',
      operation,
      permissionType: AclPermissionTypes.ALLOW,
    }
  })
}

// TODO: Write these next
export async function updateBrokersFromDb(user: User) {
  const dbDefinedAcls = await getKafkaACLsFromDynamoDB(user)
  const mappedAcls = dbDefinedAcls.flatMap((x) =>
    x.permissionType === 'producer'
      ? createProducerAcls(x)
      : createConsumerAcls(x)
  )
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
