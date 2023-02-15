/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import {
  ListUsersInGroupCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider'
import type { SNSEvent, SNSEventRecord } from 'aws-lambda'

import { simpleParser } from 'mailparser'

import {
  subjectIsValid,
  formatAuthor,
  bodyIsValid,
} from '../routes/circulars/circulars.lib'

import { extractAttributeRequired, extractAttribute } from '~/lib/cognito'
import {
  getDynamoDBAutoIncrement,
  group,
} from '~/routes/circulars/circulars.server'
import { sendEmail } from '~/lib/email'
import { getOrigin } from '~/lib/env'
import { tables } from '@architect/functions'

const cognito = new CognitoIdentityProviderClient({})
const origin = getOrigin()

// Type guarding to get around an error when trying to access `reason`
const isRejected = (
  input: PromiseSettledResult<unknown>
): input is PromiseRejectedResult => input.status === 'rejected'

async function handleRecord(record: SNSEventRecord) {
  const message = JSON.parse(record.Sns.Message)
  if (!message.content) throw new Error('Object has no body')

  const parsed = await simpleParser(
    Buffer.from(message.content, 'base64').toString()
  )
  if (!parsed.from) throw new Error('Email has no sender')

  const userEmail = parsed.from.value[0].address
  if (!userEmail)
    throw new Error(
      'Error parsing sender email from model: ' + JSON.stringify(parsed.from)
    )

  if (
    !parsed.subject ||
    !subjectIsValid(parsed.subject) ||
    !parsed.text ||
    !bodyIsValid(parsed.text)
  ) {
    await sendEmail(
      'GCN Circulars',
      userEmail,
      'GCN Circular Submission Warning: Invalid subject or body structure',
      `The submission of your Circular has been rejected, as the subject line and body do not conform to the appropriate format. Please see ${origin}/circulars/classic#submission-process for more information.`
    )
    return
  }

  // Check if submitter is in the submitters group
  const data = await cognito.send(
    new ListUsersInGroupCommand({
      GroupName: group,
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
    })
  )

  const userTypeData = data.Users?.find(
    (user) => extractAttributeRequired(user, 'email') == userEmail
  )
  const legacyUserData = !userTypeData
    ? await getLegacyUser(userEmail)
    : undefined

  if (!userTypeData && !legacyUserData) {
    await sendEmail(
      'GCN Circulars',
      userEmail,
      'GCN Circular Submission Warning: Missing permissions',
      'You do not have the required permissions to submit GCN Circulars. If you believe this to be a mistake, please fill out the form at https://heasarc.gsfc.nasa.gov/cgi-bin/Feedback?selected=kafkagcn, and we will look into resolving it as soon as possible.'
    )
    return
  }

  const userData = userTypeData
    ? {
        sub: extractAttributeRequired(userTypeData, 'sub'),
        email: extractAttributeRequired(userTypeData, 'email'),
        name: extractAttribute(userTypeData, 'name'),
        affiliation: extractAttribute(userTypeData, 'custom:affiliation'),
      }
    : {
        sub: legacyUserData.email,
        email: legacyUserData.email,
        name: legacyUserData.name,
        affiliation: legacyUserData.affiliation,
      }

  const circular = {
    dummy: 0,
    createdOn: Date.now(),
    subject: parsed.subject,
    body: parsed.text,
    sub: userData.sub,
    submitter: formatAuthor(userData),
  }
  const autoIncrement = await getDynamoDBAutoIncrement()
  const newCircularId = await autoIncrement.put(circular)

  // Send a success email
  await sendEmail(
    'GCN Circulars',
    userEmail,
    `Successfully submitted Circular: ${newCircularId}`,
    `Your circular has been successfully submitted. You may view it at ${origin}/circulars/${newCircularId}`
  )
}

export async function handler(event: SNSEvent) {
  const results = await Promise.allSettled(event.Records.map(handleRecord))
  const rejections = results.filter(isRejected).map(({ reason }) => reason)
  if (rejections.length) throw rejections
}

/**
 * Returns an entry from the legacy_users table, or undefined if none exists
 * @param userEmail
 */
async function getLegacyUser(userEmail: string) {
  const db = await tables()
  return await db.legacy_users.get({ email: userEmail })
}
