/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export function Key({
  children,
  ...props
}: Omit<JSX.IntrinsicElements['th'], 'scope'>) {
  return (
    <th scope="row" data-label="Key" {...props}>
      {children}
    </th>
  )
}

export function Description({
  children,
  ...props
}: JSX.IntrinsicElements['td']) {
  return (
    <td data-label="Description" {...props}>
      {children}
    </td>
  )
}

export function Default({ children, ...props }: JSX.IntrinsicElements['td']) {
  return (
    <td data-label="Default" {...props}>
      {children}
    </td>
  )
}
