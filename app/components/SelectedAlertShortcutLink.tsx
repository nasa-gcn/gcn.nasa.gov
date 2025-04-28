/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from '@remix-run/react'

import { JsonNoticeTypes } from './NoticeTypeCheckboxes/NoticeTypeCheckboxes'
import { NoticeTypes } from './NoticeTypeCheckboxes/Notices'
import { useEmail } from '~/root'

function buildSearchParams(
  alertKey: string,
  format: string,
  otherAlerts: string[] | undefined
) {
  const alerts =
    alertKey == 'Other'
      ? otherAlerts
      : format == 'text'
        ? NoticeTypes[alertKey]
        : JsonNoticeTypes[alertKey]

  const searchParams = new URLSearchParams()
  alerts?.forEach((alert) => {
    searchParams.append('alerts', alert)
  })
  searchParams.set('format', format)
  return searchParams
}

export function SelectedAlertEmailLink({
  alertKey,
  format,
  otherAlerts,
}: {
  alertKey: string
  format: 'json' | 'text'
  otherAlerts?: string[] // Alerts specifically under the 'Other' tab, since they can't be generically selected as all
}) {
  const userEmail = useEmail()
  const searchParams = buildSearchParams(alertKey, format, otherAlerts)

  return userEmail ? (
    <Link to={`/user/email/edit?${searchParams.toString()}`}>Email</Link>
  ) : (
    'Login to subscribe'
  )
}

export function SelectedAlertQuickstartLink({
  alertKey,
  format,
  otherAlerts,
}: {
  alertKey: string
  format: 'json' | 'text'
  otherAlerts?: string[] // Alerts specifically under the 'Other' tab, since they can't be generically selected as all
}) {
  const userEmail = useEmail()
  const searchParams = buildSearchParams(alertKey, format, otherAlerts)

  return userEmail ? (
    <Link to={`/quickstart/credentials?${searchParams.toString()}`}>
      Kafka Stream
    </Link>
  ) : (
    'Login to Stream'
  )
}
