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
  const groups = Object.entries(
    Object.groupBy(synonyms, ({ synonymId }) => ({ synonymId }))
  ).flatMap(([synonymId, values]) => [
    {
      synonymId,
      eventIds: values.map(({ eventId }) => eventId),
      slugs: values.map(({ slug }) => slug),
    },
  ])
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
