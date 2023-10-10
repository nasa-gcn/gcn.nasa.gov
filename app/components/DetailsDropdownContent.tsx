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
  ...props
}: Parameters<typeof Card>[0]) {
  return (
    <CardGroup className="position-absolute margin-top-1 z-top" role="menu">
      <Card {...props}>{children}</Card>
    </CardGroup>
  )
}
