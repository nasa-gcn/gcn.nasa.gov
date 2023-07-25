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
      id="details-content"
      className={`position-absolute z-top ${className}`}
      role="region"
      aria-label="Details Content"
    >
      <Card>{children}</Card>
    </CardGroup>
  )
}
