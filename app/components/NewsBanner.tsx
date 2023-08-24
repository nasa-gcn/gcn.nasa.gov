/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from '@remix-run/react'
import { GridContainer } from '@trussworks/react-uswds'

export default function NewsBanner({
  children,
  to,
}: {
  children: React.ReactNode
  to: Parameters<typeof Link>[0]['to']
}) {
  return (
    <div className="bg-gold padding-x-2 desktop:padding-x-4 padding-y-1 line-height-sans-3 font-lang-4 text-bold">
      <GridContainer>
        {children} See{' '}
        <Link to={to} className="hover:text-no-underline">
          news and announcements
        </Link>
      </GridContainer>
    </div>
  )
}
