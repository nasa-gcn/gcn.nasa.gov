/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { tables } from '@architect/functions'
import { services } from '@architect/functions'
import {
  AssociatePackageCommand,
  DescribePackagesCommand,
  ListPackagesForDomainCommand,
  OpenSearchClient,
  UpdatePackageCommand,
} from '@aws-sdk/client-opensearch'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { name } from '@nasa-gcn/architect-functions-search'
import groupBy from 'lodash/groupBy'

import { getEnvOrDie } from './env.server'
import { until } from './promises'

const s3 = new S3Client({})
const os = new OpenSearchClient({})

async function getSynonymsFileContents() {
  const db = await tables()
  const table = db.synonyms

  const { Items }: { Items: { uuid: string; term: string }[] } =
    await table.scan({})

  // FIXME: Replace groupBy with Array.prototype.group when it is available.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/group
  return Object.values(groupBy(Items, ({ uuid }) => uuid))
    .filter((group) => group.length > 1)
    .map((group) => group.map(({ term }) => term).join(', '))
    .join('\n')
}

async function getPackageID(): Promise<string> {
  const s = await services()
  return s.synonyms.PackageID
}

async function packageIsAvailable(PackageID: string) {
  const { PackageDetailsList } = await os.send(
    new DescribePackagesCommand({
      Filters: [{ Name: 'PackageID', Value: [PackageID] }],
    })
  )
  return PackageDetailsList?.[0]?.PackageStatus === 'AVAILABLE'
}

async function packageIsAssociated(PackageID: string, DomainName: string) {
  const { DomainPackageDetailsList } = await os.send(
    new ListPackagesForDomainCommand({ DomainName })
  )
  return (DomainPackageDetailsList ?? []).some(
    (details) =>
      details.PackageID === PackageID &&
      details.DomainPackageStatus === 'ACTIVE'
  )
}

export async function pushSynonymsToOpenSearch() {
  const [Body, PackageID, DomainName] = await Promise.all([
    getSynonymsFileContents(),
    getPackageID(),
    name(),
  ])
  if (!DomainName) throw new Error('DomainName must be defined')
  const Key = 'synonyms.txt'
  const Bucket = getEnvOrDie('ARC_STORAGE_PRIVATE_SEARCH')

  await s3.send(new PutObjectCommand({ Body, Bucket, Key }))
  await os.send(
    new UpdatePackageCommand({
      PackageID,
      PackageSource: { S3BucketName: Bucket, S3Key: Key },
    })
  )
  await until(() => packageIsAvailable(PackageID), 1000)
  await os.send(new AssociatePackageCommand({ DomainName, PackageID }))
  await until(() => packageIsAssociated(PackageID, DomainName), 1000)
}

export async function getSynonyms(term: string): Promise<string[]> {
  const db = await tables()
  const table = db.synonyms

  const uuid = (await table.get({ term }))?.uuid
  if (uuid) {
    const { Items } = await table.query({
      IndexName: 'synonymsByUuid',
      KeyConditionExpression: 'uuid = :uuid',
      ExpressionAttributeValues: { ':uuid': uuid },
      ProjectionExpression: 'term',
    })
    return Items.map(({ term }) => term)
  } else {
    return [term]
  }
}

export async function deleteSynonym(term: string) {
  const db = await tables()
  const table = db.synonyms

  await table.delete({ term })
}

export async function addSynonym(...terms: string[]) {
  const db = await tables()
  const table = db.synonyms
  const tableName = db.name('synonyms')
  const doc = db._doc as unknown as DynamoDBDocument

  // Get the unique set of UUIDs that need to be updated
  const { Responses } = await doc.batchGet({
    RequestItems: {
      [tableName]: {
        Keys: terms.map((term) => ({ term })),
        ProjectionExpression: 'uuid',
      },
    },
  })
  const uuidsToUpdate: string[] = Array.from(
    new Set(Responses?.[tableName]?.map(({ uuid }) => uuid) ?? [])
  )

  // Get the unique set of terms that need to be updated
  const { Items } = await table.query({
    IndexName: 'synonymsByUuid',
    KeyConditionExpression: 'uuid IN :uuid',
    ExpressionAttributeValues: { ':uuid': uuidsToUpdate },
    ProjectionExpression: 'term',
  })
  const termsToUpdate = Array.from(
    new Set([terms, ...Items.map(({ term }) => term)])
  )

  // Get the new UUID. Reuse an existing UUID in the set if possible.
  const uuid = uuidsToUpdate[0] ?? crypto.randomUUID()

  // Update all of the terms.
  await doc.batchWrite({
    RequestItems: {
      [tableName]: termsToUpdate.map((term) => ({ term, uuid })),
    },
  })
}
