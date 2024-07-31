/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { readFile } from 'fs/promises'

export default async function () {
  const text = await readFile('sandbox-seed.json', { encoding: 'utf-8' })
  const { circulars, synonyms } = JSON.parse(text)

  const groupedSynonyms = synonyms.reduce((accumulator, synonym) => {
    ;(accumulator[synonym.synonymId] ??= []).push(synonym.eventId)
    return accumulator
  }, {})

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
