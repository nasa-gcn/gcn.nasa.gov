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
  const { circulars } = JSON.parse(text)
  return circulars.flatMap((item) => [
    { index: { _index: 'circulars', _id: item.circularId.toString() } },
    item,
  ])
}
