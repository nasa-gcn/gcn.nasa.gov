/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { AddressObject, Source } from 'mailparser'
import { simpleParser } from 'mailparser'
import addressparser from 'nodemailer/lib/addressparser'

import type { SubmittedHow } from '~/routes/circulars/circulars.lib'

const legacyAddress = 'mailnull@capella2.gsfc.nasa.gov'
const legacyFromNameSplitter = ' via '

/**
 * Parse rewritten From addresses from capella2.
 *
 * Messages forwarded by capella2 from non-NASA addresses have From headers
 * that are rewritten like this:
 *
 * From: Albert Einstein <albert.einstein@ligo.org>
 * --rewritten to--
 * From: "Albert Einstein <albert.einstein@ligo.org> via gcncirc" <mailnull@capella2.gsfc.nasa.gov>
 *
 */
export function getFromAddress(fromAddressObject?: AddressObject) {
  let from = fromAddressObject?.value[0]
  let submittedHow: SubmittedHow
  if (from?.address === legacyAddress) {
    const i = from.name.lastIndexOf(legacyFromNameSplitter)
    if (i === -1)
      throw new Error(
        `Expected From name to contain '${legacyFromNameSplitter}'`
      )
    from = addressparser(from.name.slice(0, i), {
      flatten: true,
    })[0]
    submittedHow = 'email-legacy'
  } else {
    submittedHow = 'email'
  }
  const address = from?.address
  if (!address) throw new Error('From address is missing')
  return { address, submittedHow }
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
