/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const shortNumberFormat = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short',
})
const longNumberFormat = new Intl.NumberFormat('en-US')

export default function HumanNumber({ n }: { n: number }) {
  return (
    <span title={longNumberFormat.format(n)}>
      {shortNumberFormat.format(n)}
    </span>
  )
}
