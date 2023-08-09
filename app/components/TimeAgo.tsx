/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import dayjs from 'dayjs'
import locale from 'dayjs/locale/en'
import RelativeTime from 'dayjs/plugin/relativeTime'

dayjs.locale(locale)
dayjs.extend(RelativeTime)
const dateTimeFormat = new Intl.DateTimeFormat(locale.name, {
  dateStyle: 'full',
  timeStyle: 'long',
  timeZone: 'utc',
})

export default function TimeAgo({ time }: { time: number }) {
  return (
    <span title={dateTimeFormat.format(time)}>{dayjs(time).fromNow()}</span>
  )
}
