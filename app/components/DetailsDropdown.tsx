import { Button, Card, CardGroup, Icon } from '@trussworks/react-uswds'
import { useState } from 'react'
import type { ReactNode } from 'react'

export default function DetailsDropdown({
  summary,
  children,
  className,
}: {
  summary: ReactNode
  children: ReactNode
  className?: string
}) {
  const [showContent, setShowContent] = useState(false)

  return (
    <div className={className}>
      <Button
        className="display-flex flex-align-center usa-button usa-button--outline"
        type="button"
        onClick={() => setShowContent(!showContent)}
      >
        <span className="margin-right-auto">{summary}</span>
        <Icon.UnfoldMore />
      </Button>
      {showContent && (
        <CardGroup className="position-absolute z-top">
          <Card>{children}</Card>
        </CardGroup>
      )}
    </div>
  )
}
