/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { SiteAlert } from '@trussworks/react-uswds'

const production_hostname = 'gcn.nasa.gov'

export function DevBanner({ hostname }: { hostname: string }) {
  if (hostname === production_hostname) return null

  let heading: string
  let description: string

  if (hostname === `dev.${production_hostname}`) {
    heading = 'Development'
    description = 'the internal development version'
  } else if (hostname === `test.${production_hostname}`) {
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
