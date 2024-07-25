/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { dedent } from 'ts-dedent'

import { Highlight } from '~/components/Highlight'

import { $id } from '@nasa-gcn/schema/gcn/notices/core/Alert.schema.json'

export function SampleHeartbeat() {
  return (
    <Highlight
      language="json"
      code={dedent(`{
      "$schema": "${$id}",
      "alert_datetime": "2024-07-25T15:50:35.792451Z"
    }`)}
    />
  )
}
