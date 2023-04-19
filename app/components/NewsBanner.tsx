/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { Link } from '@remix-run/react'
import { GridContainer } from '@trussworks/react-uswds'

export default function NewsBanner({ message }: { message: string }) {
  return (
    <div className="bg-gold padding-x-2 desktop:padding-x-4 padding-y-1 line-height-sans-3 font-lang-4 text-bold">
      <GridContainer>
        {message} See{' '}
        <Link to="/news" className="hover:text-no-underline">
          news and announcements
        </Link>
      </GridContainer>
    </div>
  )
}
