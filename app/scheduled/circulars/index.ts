/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { paginateScan } from '@aws-sdk/lib-dynamodb'

import { uploadTar } from './uploadTar'
import { type Circular } from '~/routes/circulars/circulars.lib'

interface CircularAction {
  callback: (circularArray: Circular[]) => void
}

async function mapCirculars(...actions: CircularAction[]) {
  for await (const circularArray of getAllRecords()) {
    for (const action of actions) {
      action.callback(circularArray)
    }
  }
}

async function* getAllRecords(): AsyncGenerator<Circular[], void, unknown> {
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('circulars')
  const pages = paginateScan({ client }, { TableName })

  for await (const page of pages) {
    const items: Circular[] = page.Items as Circular[]
    yield items
  }
}

// FIXME: must use module.exports here for OpenTelemetry shim to work correctly.
// See https://dev.to/heymarkkop/how-to-solve-cannot-redefine-property-handler-on-aws-lambda-3j67
module.exports.handler = async () => {
  const actions: CircularAction[] = [{ callback: uploadTar }]

  await mapCirculars(...actions)
}
