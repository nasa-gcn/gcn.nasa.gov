/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Button, Icon } from '@trussworks/react-uswds'
import type { ButtonProps } from 'node_modules/@trussworks/react-uswds/lib/components/Button/Button'
import type { ReactNode } from 'react'

export default function DetailsDropdownButton({
  children,
  ...props
}: {
  children: ReactNode
} & Omit<ButtonProps & JSX.IntrinsicElements['button'], 'type'>) {
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
