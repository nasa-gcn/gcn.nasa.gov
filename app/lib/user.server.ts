/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'

import { sendUserEmailVerificationMessage } from './email.server'

export type UserMetadata = {
  sub: string
  email: string
  username?: string
  affiliation?: string
  validEmails: EmailItem[]
}

export type EmailItem = {
  address: string
  verified: boolean
}

export async function getValidEmails(sub: string) {
  const db = await tables()
  return ((await db.users.get({ sub })) as UserMetadata).validEmails.filter(
    (x) => x.verified
  )
}

export async function updateUserFields(
  sub: string,
  username: string,
  affiliation: string
) {
  const db = await tables()
  await db.users.update({
    Key: { sub },
    UpdateExpression: 'set username = :username, affiliation = :affiliation',
    ExpressionAttributeValues: {
      ':affiliation': affiliation,
      ':username': username,
    },
  })
}

export async function getAllUserEmails(sub: string) {
  const db = await tables()
  return ((await db.users.get({ sub })) as UserMetadata).validEmails
}

export async function addNewUserEmail(sub: string, address: string) {
  const newItem = { address, verified: false }
  const previouslyVerified = { address, verified: true }
  const db = await tables()
  try {
    await db.users.update({
      Key: { sub },
      ConditionExpression:
        'NOT contains(validEmails, :newItem) AND NOT contains(validEmails, :previouslyVerified)',
      UpdateExpression:
        'set validEmails = list_append(validEmails, :newItemList)',
      ExpressionAttributeValues: {
        ':newItemList': [newItem],
        ':newItem': newItem,
        ':previouslyVerified': previouslyVerified,
      },
    })
    await sendUserEmailVerificationMessage(sub, address)
  } catch (error) {
    if (!(error instanceof ConditionalCheckFailedException)) {
      throw error
    }
    console.warn('Duplicate email provided')
  }
}

export async function removeUserEmailAddress(sub: string, address: string) {
  const userEmails = (await getAllUserEmails(sub)).filter(
    (item) => item.address !== address
  )
  const db = await tables()
  await db.users.update({
    Key: { sub },
    UpdateExpression: 'set validEmails = :validEmails',
    ExpressionAttributeValues: {
      ':validEmails': userEmails,
    },
  })
}

export async function setAddressVerified(sub: string, address: string) {
  const emails = await getAllUserEmails(sub)
  const addressToverify = emails.find((x) => x.address === address)
  if (!addressToverify) throw new Response(null, { status: 400 })
  addressToverify.verified = true
  const db = await tables()
  await db.users.update({
    Key: { sub },
    UpdateExpression: 'set validEmails = :validEmails',
    ExpressionAttributeValues: {
      ':validEmails': emails,
    },
  })
}
