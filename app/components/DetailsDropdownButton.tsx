/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Button, Icon } from '@trussworks/react-uswds'
import type { ButtonProps } from '@trussworks/react-uswds/lib/components/Button/Button'
import type { ReactNode } from 'react'

export default function DetailsDropdownButton({
  children,
  className,
  ...props
}: {
  children: ReactNode
  className?: string
} & Omit<ButtonProps & JSX.IntrinsicElements['button'], 'type'>) {
  return (
    <Button className={`${className ?? ''}`} type="button" {...props}>
      {children}
      <Icon.ExpandMore role="presentation" />
    </Button>
  )
}
