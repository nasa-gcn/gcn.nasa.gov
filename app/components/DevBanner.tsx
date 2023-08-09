/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { SiteAlert } from '@trussworks/react-uswds'

import { getEnvBannerHeaderAndDescription } from '~/lib/utils'
import { useHostname } from '~/root'

const production_hostname = 'gcn.nasa.gov'

export function DevBanner() {
  const hostname = useHostname()
  if (hostname === production_hostname) return null
  const { heading, description } = getEnvBannerHeaderAndDescription(hostname)

  return (
    <SiteAlert slim variant="emergency">
      <strong>{heading}.</strong> You are viewing {description} of GCN. For the
      production version, go to{' '}
      <a className="text-white" href={`https://${production_hostname}/`}>
        https://{production_hostname}
      </a>
      .
    </SiteAlert>
  )
}
