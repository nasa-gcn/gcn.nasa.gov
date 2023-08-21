/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { SESMessage, SNSEventRecord, SNSMessage } from 'aws-lambda'

import { getEnvOrDie } from '~/lib/env.server'
import {
  allSettledOrRaise,
  createTriggerHandler,
} from '~/lib/lambdaTrigger.server'

const s3 = new S3Client({})
const Bucket = getEnvOrDie('ARC_STORAGE_PRIVATE_EMAIL_INCOMING')

interface SESMessageWithContent extends SESMessage {
  content: Buffer
}

interface SESMessageWithContentBase64 extends SESMessage {
  content: string
}

export function createEmailIncomingMessageHandler(
  messageHandler: (message: SESMessageWithContent) => Promise<void>
) {
  // Save a copy of the message in an S3 bucket for debugging.
  // FIXME: remove this later?
  async function save({ Message, MessageId }: SNSMessage) {
    await s3.send(
      new PutObjectCommand({
        Bucket,
        Key: `${MessageId}.json`,
        Body: Message,
      })
    )
  }

  // Check Amazon SES's email authentication verdicts.
  // If they pass, then call the handler.
  async function process({ Message }: SNSMessage) {
    const { content: base64, ...message }: SESMessageWithContentBase64 =
      JSON.parse(Message)

    if (message.receipt.spamVerdict.status !== 'PASS')
      throw new Error('Message failed spam check')
    else if (message.receipt.virusVerdict.status !== 'PASS')
      throw new Error('Message failed virus check')

    const content = Buffer.from(base64, 'base64')
    await messageHandler({ content, ...message })
  }

  return createTriggerHandler(async ({ Sns }: SNSEventRecord) => {
    await allSettledOrRaise([save(Sns), process(Sns)])
  })
}
