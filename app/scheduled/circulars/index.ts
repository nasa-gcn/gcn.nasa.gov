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

import type { CircularAction } from './circularAction'
import { jsonUploadAction, txtUploadAction } from './uploadTar'
import { type Circular } from '~/routes/circulars/circulars.lib'

async function mapCirculars(...actions: CircularAction[]) {
  const contexts = await Promise.all(
    actions.map((action) => action.initialize())
  )
  for await (const circulars of getAllRecords()) {
    await Promise.all(
      actions.map(({ action }, i) => action(circulars, contexts[i]))
    )
  }
  await Promise.all(actions.map(({ finalize }, i) => finalize(contexts[i])))
}

async function* getAllRecords() {
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('circulars')
  const pages = paginateScan({ client }, { TableName })

  for await (const page of pages) {
    yield page.Items as Circular[]
  }
}

// FIXME: must use module.exports here for OpenTelemetry shim to work correctly.
// See https://dev.to/heymarkkop/how-to-solve-cannot-redefine-property-handler-on-aws-lambda-3j67
module.exports.handler = async () => {
  await mapCirculars(jsonUploadAction, txtUploadAction)
}
