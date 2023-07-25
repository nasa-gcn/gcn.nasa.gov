import { Card, CardGroup } from '@trussworks/react-uswds'
import type { ReactNode } from 'react'

export default function DetailsDropdownContent({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <CardGroup
      className={`position-absolute z-top ${className ?? ''}`}
      role="menu"
    >
      <Card>{children}</Card>
    </CardGroup>
  )
}
