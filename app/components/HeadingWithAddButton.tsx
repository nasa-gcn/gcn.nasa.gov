/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { Link } from '@remix-run/react'
import { Grid, Icon } from '@trussworks/react-uswds'

export default function HeadingWithAddButton({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Grid row>
      <Grid tablet={{ col: 'fill' }}>
        <h1>{children}</h1>
      </Grid>
      <Grid tablet={{ col: 'auto' }}>
        <Link className="usa-button tablet:margin-right-2" to="edit">
          <Icon.Add className="bottom-aligned margin-right-05" />
          Add
        </Link>
      </Grid>
    </Grid>
  )
}
