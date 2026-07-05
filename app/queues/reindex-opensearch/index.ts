/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
// import { tables } from '@architect/functions'
import type { SQSEvent } from 'aws-lambda'

import { runReindex } from '~/lib/opensearch.server'

export async function handler(event: SQSEvent) {
  for (const record of event.Records) {
    const { indexName } = JSON.parse(record.body)
    // TODO: Support creation of new index and pointing to these using aliases
    await runReindex(indexName)
  }
}
