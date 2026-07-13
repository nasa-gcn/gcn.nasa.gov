/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { AclEntry } from 'gcn-kafka'
import {
  AclOperationTypes,
  AclPermissionTypes,
  AclResourceTypes,
  Kafka,
  KafkaJSError,
  ResourcePatternTypes,
} from 'gcn-kafka'
import memoizee from 'memoizee'
import { custom } from 'openid-client'

import { domain, getEnvOrDieInProduction } from './env.server'
import type { Team, Topic } from './teams.server'
import type { User } from '~/routes/_auth/user.server'

export type UserClientType = 'producer' | 'consumer'

const operations = {
  // Read only permissions
  consumer: [AclOperationTypes.READ, AclOperationTypes.DESCRIBE],
  // Read and write permissions
  producer: [
    AclOperationTypes.CREATE,
    AclOperationTypes.READ,
    AclOperationTypes.WRITE,
    AclOperationTypes.DESCRIBE,
  ],
}

const resourceTypes = [
  ResourcePatternTypes.LITERAL,
  ResourcePatternTypes.PREFIXED,
]

const client_id = getEnvOrDieInProduction('KAFKA_CLIENT_ID') ?? ''
const client_secret = getEnvOrDieInProduction('KAFKA_CLIENT_SECRET')
const kafka = new Kafka({
  client_id,
  client_secret,
  domain,
})

const admin_client_id = getEnvOrDieInProduction('KAFKA_ADMIN_CLIENT_ID') ?? ''
const admin_client_secret = getEnvOrDieInProduction('KAFKA_ADMIN_CLIENT_SECRET')
const adminKafka = new Kafka({
  client_id: admin_client_id,
  client_secret: admin_client_secret,
  domain,
})

function setOidcHttpOptions() {
  // Increase the timeout used for OpenID Connect requests.
  // See https://github.com/nasa-gcn/gcn.nasa.gov/issues/2659
  custom.setHttpOptionsDefaults({ timeout: 10_000 })
}

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
    setOidcHttpOptions()
    const producer = kafka.producer()
    await producer.connect()
    try {
      await producer.send({ topic, messages: [{ value }] })
    } catch (e) {
      if (e instanceof KafkaJSError) {
        console.warn(
          'Failed to send Kafka message. This would be an error in production.'
        )
      } else {
        throw e
      }
    } finally {
      await producer.disconnect()
    }
  }
} else {
  // FIXME: remove memoizee and use top-level await once we switch to ESM builds.
  const getProducer = memoizee(
    async () => {
      setOidcHttpOptions()
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

function formatTeamName(teamName: string) {
  return teamName.toLowerCase().replaceAll(' ', '_')
}

/**
 * Updates the Kafka broker with new Kafka ACL Entries.
 * Should be called after team creation.
 *
 * @throws 403 response if the user is not a GCN admin
 *
 */
export async function createTeamAcls(user: User, topic: Topic, team: Team) {
  if (!user.groups.includes('gcn.nasa.gov/gcn-admin')) {
    throw new Response(null, { status: 403 })
  }
  const formattedTeamName = formatTeamName(team.teamName)
  const consumerAcls = buildAcls(topic.topicName, formattedTeamName, 'consumer')
  if (topic.public) {
    consumerAcls.push(...buildAcls(topic.topicName, '*', 'consumer'))
  }
  const producerAcls = buildAcls(topic.topicName, formattedTeamName, 'producer')
  const adminClient = adminKafka.admin()
  await adminClient.connect()
  await adminClient.createAcls({ acl: [...consumerAcls, ...producerAcls] })
}

/**
 * Deletes all acls for a given topic.
 * @param user
 * @param topic
 * @param team
 */
export async function deleteTeamAcls(user: User, topic: Topic, team: Team) {
  if (!user.groups.includes('gcn.nasa.gov/gcn-admin')) {
    throw new Response(null, { status: 403 })
  }

  const formattedTeamName = formatTeamName(team.teamName)
  const aclsToDelete = [
    // Producer topics
    ...buildAcls(topic.topicName, formattedTeamName, 'producer'),
    // Private Consumer topics
    ...buildAcls(topic.topicName, formattedTeamName, 'consumer'),
    // Public Consumer topics
    ...buildAcls(topic.topicName, '*', 'consumer'),
  ]
  const adminClient = adminKafka.admin()
  await adminClient.connect()
  await adminClient.deleteAcls({
    filters: aclsToDelete,
  })
}

/**
 * Creates public consumer acl rules on the broker if topic.pulic is true,
 * deletes them otherwise
 */
export async function toggleTopicPrivacy(user: User, topic: Topic) {
  // TODO: Add check for userIsTeamAdmin when that function is merged
  const acls = buildAcls(topic.topicName, '*', 'consumer')
  const adminClient = adminKafka.admin()
  await adminClient.connect()
  if (topic.public) {
    await adminClient.createAcls({ acl: acls })
  } else {
    await adminClient.deleteAcls({ filters: acls })
  }
}

export async function getAclsFromBrokers(user: User): Promise<AclEntry[]> {
  if (!user.groups.includes('gcn.nasa.gov/gcn-admin'))
    throw new Response(null, { status: 403 })
  const adminClient = adminKafka.admin()
  await adminClient.connect()
  const acls = await adminClient.describeAcls({
    resourceType: AclResourceTypes.ANY,
    host: '*',
    permissionType: AclPermissionTypes.ANY,
    operation: AclOperationTypes.ANY,
    resourcePatternType: ResourcePatternTypes.ANY,
  })
  await adminClient.disconnect()
  const results: AclEntry[] = []
  for (const item of acls.resources) {
    results.push(
      ...item.acls.map((acl) => {
        return {
          ...acl,
          resourceName: item.resourceName,
          resourceType: item.resourceType,
          resourcePatternType: item.resourcePatternType,
        }
      })
    )
  }

  return results
}

/**
 * Constructs an array of AclEntry objects based on the provided principal type.
 *
 * The returned array will have AclEntry objects for both the LITERAL and PREFIXED
 * resource types.
 *
 * The format of `principal` on each AclEntry will be: `principalType:formattedTeamName`,
 * e.g. `consumer:team_a`, `producer:team_a`
 *
 * @param topicName name of the topic, should NOT end with a period or have trailing
 * whitespace, as a period will automatically be appended for the PREFIX AclEntries
 * @param formattedTeamName the team name in lowercase with spaces replaced with '_'.
 * If "*" is provided as `formattedTeamName`, this will return the AclEntries to make
 * the topic publicly available.
 * @param principalType `producer` or `consumer`, which map as keys in the
 * `operations` const
 */
function buildAcls(
  topicName: string,
  formattedTeamName: string,
  principalType: UserClientType
): AclEntry[] {
  return resourceTypes.flatMap((type) =>
    operations[principalType].map((operation) => {
      return {
        resourceType: AclResourceTypes.TOPIC,
        resourceName: `${topicName}${type === ResourcePatternTypes.PREFIXED ? '.' : ''}`,
        resourcePatternType: type,
        principal:
          formattedTeamName == '*'
            ? 'User:*'
            : `${principalType}:${formattedTeamName}`, // This may need to be User:`${principalType}:${formattedTeamName}`, still testing
        host: '*',
        operation,
        permissionType: AclPermissionTypes.ALLOW,
      }
    })
  )
}
