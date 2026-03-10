/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from '@remix-run/react'
import { Grid, Icon } from '@trussworks/react-uswds'
import classNames from 'classnames'

export default function HeadingWithAddButton({
  headingLevel = 1,
  children,
}: {
  headingLevel: 1 | 2 | 3 | 4 | 5 | 6
  children: React.ReactNode
}) {
  const CustomTag = `h${headingLevel}` as keyof JSX.IntrinsicElements

  return (
    <Grid row>
      <Grid tablet={{ col: 'fill' }}>
        <CustomTag>{children}</CustomTag>
      </Grid>
      <Grid tablet={{ col: 'auto' }}>
        <Link
          className={classNames('usa-button', 'tablet:margin-right-2', {
            'tablet:margin-top-105': headingLevel > 1,
          })}
          to="edit"
        >
          <Icon.Add role="presentation" className="margin-y-neg-2px" />
          Add
        </Link>
      </Grid>
    </Grid>
  )
}
