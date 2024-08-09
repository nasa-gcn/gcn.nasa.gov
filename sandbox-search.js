/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { readFile } from 'fs/promises'
import _ from 'lodash'

export default async function () {
  const text = await readFile('sandbox-seed.json', { encoding: 'utf-8' })
  const { circulars, synonyms } = JSON.parse(text)
  const groupedSynonyms = _.groupBy(synonyms, 'synonymId')
  const groups = Object.keys(groupedSynonyms).map((id) => ({
    synonymId: id,
    eventIds: groupedSynonyms[id],
  }))

  return [
    ...circulars.flatMap((item) => [
      { index: { _index: 'circulars', _id: item.circularId.toString() } },
      item,
    ]),
    ...groups.flatMap((item) => [
      { index: { _index: 'synonym-groups', _id: item.synonymId.toString() } },
      item,
    ]),
  ]
}
