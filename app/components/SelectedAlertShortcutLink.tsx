import { Link } from '@remix-run/react'

import {
  JsonNoticeTypes,
  NoticeTypes,
} from './NoticeTypeCheckboxes/NoticeTypeCheckboxes'
import { WithCredentials, useEmail } from '~/root'

export default function SelectedAlertShortcutLink({
  alertKey,
  format,
  otherAlerts,
  destination,
}: {
  alertKey: string
  format: 'json' | 'text'
  destination: 'quickstart' | 'email'
  otherAlerts?: string[] // Alerts specifically under the 'Other' tab, since they can't be generically selected as all
}) {
  const userCredentials = WithCredentials()
  const userEmail = useEmail()

  const selectedAlerts =
    alertKey == 'Other'
      ? otherAlerts?.map((alert) => `&alerts=${alert}`).join('')
      : (format == 'text' ? NoticeTypes[alertKey] : JsonNoticeTypes[alertKey])
          ?.map((alert) => `&alerts=${alert}`)
          .join('')

  const baseUrl =
    destination == 'quickstart'
      ? `/quickstart/alerts?clientId=${WithCredentials()}&format=${format}${selectedAlerts}`
      : `/user/email/edit?format=${format}${selectedAlerts}`

  if (destination == 'email') {
    return userEmail ? (
      <Link to={`${baseUrl}&format=${format}${selectedAlerts}`}>Email</Link>
    ) : (
      'Login to subscribe'
    )
  } else {
    return userCredentials ? (
      <Link to={`${baseUrl}&format=${format}${selectedAlerts}`}>
        Kafka Stream
      </Link>
    ) : userEmail ? (
      <Link to="/user/credentials/edit">Generate Credentials</Link>
    ) : (
      'Login to stream'
    )
  }
}
