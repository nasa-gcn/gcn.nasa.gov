/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Card, CardGroup } from '@trussworks/react-uswds'

export default function DetailsDropdownContent({
  children,
  className,
  ...props
}: Omit<JSX.IntrinsicElements['ul'], 'role'>) {
  return (
    <CardGroup
      {...props}
      className={`position-absolute z-top ${className ?? ''}`}
      role="menu"
    >
      <Card>{children}</Card>
    </CardGroup>
  )
}
