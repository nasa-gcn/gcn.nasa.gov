/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Button, Icon } from '@trussworks/react-uswds'
import type { ReactNode } from 'react'

export default function DetailsDropdownButton({
  children,
  expanded,
  ...props
}: {
  children: ReactNode
  expanded?: boolean
} & Omit<Parameters<typeof Button>[0], 'type'>) {
  return (
    <Button type="button" {...props}>
      {children}
      {expanded ? (
        <Icon.ExpandLess role="presentation" className="margin-y-neg-2px" />
      ) : (
        <Icon.ExpandMore role="presentation" className="margin-y-neg-2px" />
      )}
    </Button>
  )
}
