/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { SESMessage, SNSMessage } from 'aws-lambda'

import { createTriggerHandler } from '~/lib/lambdaTrigger.server'

const s3 = new S3Client({})

interface SESMessageWithContent extends SESMessage {
  content: Buffer
}

// Check Amazon SES's email authentication verdicts.
// If they pass, then call the handler.
export function createEmailIncomingMessageHandler(
  messageHandler: (message: SESMessageWithContent) => Promise<void>
) {
  return createTriggerHandler(async ({ Message }: SNSMessage) => {
    const message: SESMessage = JSON.parse(Message)

    if (message.receipt.spamVerdict.status !== 'PASS')
      throw new Error('Message failed spam check')
    if (message.receipt.virusVerdict.status !== 'PASS')
      throw new Error('Message failed virus check')
    if (message.receipt.action.type !== 'S3')
      throw new Error('Action type must be S3')

    const response = await s3.send(
      new GetObjectCommand({
        Bucket: message.receipt.action.bucketName,
        Key: message.receipt.action.objectKey,
      })
    )
    const bytes = await response.Body?.transformToByteArray()
    if (!bytes) throw new Error('No bytes')
    const content = Buffer.from(bytes)

    await messageHandler({ content, ...message })
  })
}
