/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { tables } from '@architect/functions'

import {
  bodyIsValid,
  formatAuthor,
  subjectIsValid,
} from '../../routes/circulars/circulars.lib'
import { createEmailIncomingMessageHandler } from '../handler'
import {
  getFromAddress,
  getReplyToAddresses,
  parseEmailContentFromSource,
} from './parse'
import {
  extractAttribute,
  extractAttributeRequired,
  listUsersInGroup,
} from '~/lib/cognito.server'
import { sendEmail } from '~/lib/email.server'
import { hostname, origin } from '~/lib/env.server'
import { group, putRaw } from '~/routes/circulars/circulars.server'

interface UserData {
  email: string
  sub?: string
  name?: string
  affiliation?: string
  receive?: boolean
  submit?: boolean
}

interface EmailProps {
  subjectMessage: string
  userEmail: string
  to: string[]
  body: string
  parsedSubmissionSubject: string
  circularId?: number
}

const fromName = 'GCN Circulars'

// FIXME: must use module.exports here for OpenTelemetry shim to work correctly.
// See https://dev.to/heymarkkop/how-to-solve-cannot-redefine-property-handler-on-aws-lambda-3j67
module.exports.handler = createEmailIncomingMessageHandler(
  async ({ content }) => {
    const parsed = await parseEmailContentFromSource(content)
    const userEmail = getFromAddress(parsed.from)
    const to = getReplyToAddresses(parsed.replyTo) ?? [userEmail]

    const userData =
      (await getCognitoUserData(userEmail)) ??
      (await getLegacyUserData(userEmail))

    if (!userData || !userData.submit) {
      await sendFailureEmail({
        subjectMessage: 'Not an authorized submitter',
        userEmail,
        to,
        body: `The email address you are submitting this circular from is not approved to submit GCN Circulars. To become an approved submitter, please sign in to ${origin} and see ${origin}/user/endorsements`,
        parsedSubmissionSubject: parsed.subject ?? '',
      })
      return
    }

    if (
      !parsed.subject ||
      !subjectIsValid(parsed.subject) ||
      !parsed.text ||
      !bodyIsValid(parsed.text)
    ) {
      await sendFailureEmail({
        subjectMessage: 'Invalid subject or body',
        userEmail,
        to,
        body: `The subject line and body do not conform to the appropriate format. Please see ${origin}/circulars/classic#submission-process for more information.`,
        parsedSubmissionSubject: parsed.subject ?? 'No Subject Provided',
      })
      return
    }

    const circular = {
      subject: parsed.subject,
      body: parsed.text,
      sub: userData.sub,
      submitter: formatAuthor(userData),
    }

    // Removes sub as a property if it is undefined from the legacy users
    if (!circular.sub) delete circular.sub
    const { circularId } = await putRaw(circular)

    // Send a success email
    await sendSuccessEmail({
      userEmail,
      to,
      subjectMessage: `${circularId}`,
      body: '',
      parsedSubmissionSubject: parsed.subject,
      circularId,
    })
  }
)

/**
 * Returns a UserData object constructed from cognito if the
 * user is in the Submitters group
 * @param userEmail
 */
async function getCognitoUserData(
  userEmail: string
): Promise<UserData | undefined> {
  const users = await listUsersInGroup(group)
  const userTypeData = users.find(
    (user) => extractAttributeRequired(user, 'email') == userEmail
  )
  return (
    userTypeData && {
      sub: extractAttributeRequired(userTypeData, 'sub'),
      email: extractAttributeRequired(userTypeData, 'email'),
      name: extractAttribute(userTypeData, 'name'),
      affiliation: extractAttribute(userTypeData, 'custom:affiliation'),
      submit: true,
    }
  )
}

/**
 * Returns a UserData object constructed from the legacy_users table
 * or undefined if none exists
 * @param userEmail
 */
async function getLegacyUserData(
  userEmail: string
): Promise<UserData | undefined> {
  const db = await tables()
  const data = await db.legacy_users.get({ email: userEmail })
  return (
    data && {
      email: data.email,
      name: data.name,
      affiliation: data.affiliation,
      receive: data.receive,
      submit: data.submit,
    }
  )
}

function successMessage(
  userEmail: string,
  subject: string,
  explanation: string
) {
  return `Your GCN Circular from ${userEmail} (subject: ${subject}) was received and distributed.
  
  ${explanation}`
}

function failedMessage(
  userEmail: string,
  subject: string,
  explanation: string
) {
  return `Your GCN Circular from ${userEmail} (subject: ${subject}) was not processed for the following reasons:
  
${explanation}

If you believe this to be a mistake, please contact us using the form at ${origin}/contact, and we will look into resolving it as soon as possible.`
}

const sharedEmailBody = `



---



As of April 12, 2023, GCN Circulars are being administered through the new General Coordinates Network (GCN; ${origin}), and no longer through the GCN Classic service (https://gcn.gsfc.nasa.gov).
      
The new GCN Circulars allow you to:

- Browse and search Circulars in our all-new archive.
- Sign yourself up or manage your own email subscriptions.
- Enroll yourself and your colleagues to submit Circulars with arXiv-style peer endorsements for new contributors.
- Submit Circulars with our new Web form, or continue to submit by email.

If you have not already done so, we encourage you to make an account at ${origin}. Even if you have not yet created a new account, these features provide continuity with the legacy GCN Classic service:

- Your Circulars settings have been transferred automatically.
- You are able to submit Circulars from the same email addresses registered in the legacy service.
- Emails from GCN come from a new address, no-reply@${hostname}.
- We encourage you to submit Circulars to the new address, circulars@${hostname}, but we still support the old address gcncirc@capella2.gsfc.nasa.gov.
- The new archive, ${origin}/circulars, includes all past Circulars. We have frozen the old archive, https://gcn.gsfc.nasa.gov/gcn3_archive.html.

For more information about the GCN Circulars, please see ${origin}/circulars.

For questions, issues, or bug reports, please contact the GCN Team via:

Feedback form:
${origin}/contact

GitHub issue tracker:
https://github.com/nasa-gcn/gcn.nasa.gov/issues`

async function sendSuccessEmail(props: EmailProps) {
  await sendEmail({
    fromName,
    to: props.to,
    subject: `GCN Circular Submission Successful: ${props.subjectMessage}`,
    body:
      successMessage(
        props.userEmail,
        props.parsedSubmissionSubject,
        `The email message you submitted to the GCN Circular service has been received and is being distributed to the GCN Circulars subscribers, and posted to the GCN Circulars archive (${origin}/circulars/${props.circularId}). If you have selected to receive Circulars, then you will receive your copy shortly.`
      ) + sharedEmailBody,
  })
}

async function sendFailureEmail(props: EmailProps) {
  await sendEmail({
    fromName,
    to: props.to,
    subject: `GCN Circular Submission Failed: ${props.subjectMessage}`,
    body:
      failedMessage(
        props.userEmail,
        props.parsedSubmissionSubject,
        props.body
      ) + sharedEmailBody,
  })
}
