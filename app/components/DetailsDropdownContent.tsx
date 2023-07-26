/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { Card, CardGroup } from '@trussworks/react-uswds'
import type { ReactNode } from 'react'

export default function DetailsDropdownContent({
  children,
  className,
  ...props
}: : Omit<JSX.IntrinsicElements['ul'], 'role'>) {
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
