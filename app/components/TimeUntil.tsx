/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import dayjs from 'dayjs'

import { dateTimeFormat } from './TimeAgo'

/**
 *
 * @param time - Date in milliseconds
 * @param timeDifference - Offset in milliseconds that `time` should be compared to
 */
export default function TimeUntil({
  time,
  timeDifference,
}: {
  time: number
  timeDifference: number
}) {
  return (
    <span title={dateTimeFormat.format(time + timeDifference)}>
      {dayjs(Date.now()).to(time + timeDifference)}
    </span>
  )
}
