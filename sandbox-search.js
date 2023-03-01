/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

const { readFile } = require('fs/promises')

const _index = 'circulars'

module.exports = async function () {
  const text = await readFile('sandbox-seed.json', { encoding: 'utf-8' })
  const { circulars } = JSON.parse(text)
  return [
    { create: { _index } },
    {
      mappings: {
        properties: {
          circularId: { type: 'integer' },
          createdOn: { type: 'date', format: 'epoch_millis' },
          submitter: { type: 'text' },
          subject: { type: 'text' },
          body: { type: 'text' },
        },
      },
    },
    ...circulars.flatMap((item) => {
      delete item.dummy
      return [{ index: { _index, _id: item.circularId.toString() } }, item]
    }),
  ]
}
