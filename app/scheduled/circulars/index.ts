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

import type { CircularAction, CircularActionContext } from './circularAction'
import { finalizeTar, setupTar, uploadJsonTar, uploadTxtTar } from './uploadTar'
import { type Circular } from '~/routes/circulars/circulars.lib'

async function mapCirculars(
  ...actions: CircularAction<CircularActionContext>[]
) {
  for await (const circularArray of getAllRecords()) {
    for (const action of actions) {
      // the context is based on either the initial setup context or the context of the callback return
      const context = action.currentContext
        ? action.currentContext
        : action.initialContext()
      const results = await action.callback(circularArray, context)
      action.currentContext = results
    }
  }
  for (const action of actions) {
    // the finalize context is based the final results of the callback function
    await action.finalize(action.currentContext)
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
  const actions: CircularAction<CircularActionContext>[] = [
    {
      callback: uploadJsonTar,
      initialContext: setupTar,
      finalize: finalizeTar,
      currentContext: { context: {} },
    },
    {
      callback: uploadTxtTar,
      initialContext: setupTar,
      finalize: finalizeTar,
      currentContext: { context: {} },
    },
  ]

  await mapCirculars(...actions)
}
