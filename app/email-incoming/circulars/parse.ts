/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { AddressObject, Source } from 'mailparser'
import { simpleParser } from 'mailparser'

export function getFromAddress(fromAddressObject?: AddressObject) {
  const from = fromAddressObject?.value[0]
  const address = from?.address
  if (!address) throw new Error('From address is missing')
  return address
}

export function getReplyToAddresses(replyTo?: AddressObject) {
  const result = replyTo?.value
    .map(({ address }) => address)
    .filter(Boolean) as string[] | undefined
  return result?.length ? result : undefined
}

export async function parseEmailContentFromSource(emailContent: Source) {
  const parsedMail = await simpleParser(emailContent)
  // sns includes the attachments if there are any.
  // Remove this if we want to implement some type of behavior for attachments
  parsedMail.attachments = []
  return parsedMail
}
