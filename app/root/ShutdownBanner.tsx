/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from '@remix-run/react'
import { GridContainer } from '@trussworks/react-uswds'

export default function ShutdownBanner() {
  return (
    <div className="bg-primary-dark padding-x-2 desktop:padding-x-4 padding-y-1 line-height-sans-3 font-lang-4 text-white">
      <GridContainer>
        Due to the lapse in federal government funding, NASA is not updating
        this website. See the{' '}
        <Link to="/docs/faq#operations" className="text-white">
          Operations FAQ
        </Link>{' '}
        for GCN impacts.
      </GridContainer>
    </div>
  )
}
