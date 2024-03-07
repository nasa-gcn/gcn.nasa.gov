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
  ...props
}: {
  children: ReactNode
} & Omit<Parameters<typeof Button>[0], 'type'>) {
  return (
    <Button type="button" {...props}>
      {children}
      <Icon.ExpandMore
        role="presentation"
        className="margin-top-neg-1 bottom-aligned"
      />
    </Button>
  )
}
