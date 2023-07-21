import { Card, CardGroup, Icon } from '@trussworks/react-uswds'
import type { ReactNode } from 'react'

export default function DetailsDropdown({
  summary,
  children,
}: {
  summary: ReactNode
  children: ReactNode
}) {
  return (
    <details id="selectedVersionDetails" className="margin-top-1">
      <summary
        id="selectedVersionSummary"
        className="display-flex usa-button usa-button--outline grid-col-12 flex-align-center"
      >
        <span className="margin-right-auto">{summary}</span>
        <Icon.UnfoldMore />
      </summary>
      <div className="position-absolute z-top">
        <CardGroup>
          <Card gridLayout={{ tablet: { col: 'fill' } }}>{children}</Card>
        </CardGroup>
      </div>
    </details>
  )
}
