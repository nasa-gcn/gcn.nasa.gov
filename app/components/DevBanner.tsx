import { SiteAlert } from '@trussworks/react-uswds'

const production_hostname = 'gcn.nasa.gov'

export function DevBanner({ hostname }: { hostname: string }) {
  if (hostname === production_hostname) return null

  let heading: string
  let description: string

  if (hostname === `dev.${hostname}`) {
    heading = 'Development'
    description = 'the internal development version'
  } else if (hostname === `test.${hostname}`) {
    heading = 'Testing'
    description = 'the public testing version'
  } else if (hostname === 'localhost') {
    heading = 'Local Development'
    description = 'a local development version'
  } else {
    heading = 'Non-Production'
    description = 'a non-production version'
  }

  return (
    <SiteAlert variant="emergency" heading={heading}>
      You are viewing {description} of GCN.
    </SiteAlert>
  )
}
