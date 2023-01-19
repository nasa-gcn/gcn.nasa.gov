/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import classnames from 'classnames'
import loaderImage from 'app/theme/img/loader.gif'

// Adapted from https://github.com/trussworks/react-uswds/blob/main/src/components/Icon/Icon.tsx
export default function Spinner({
  size,
  className,
  ...props
}: { size?: 3 | 4 | 5 | 6 | 7 | 8 | 9 } & JSX.IntrinsicElements['img']) {
  return (
    <img
      src={loaderImage}
      alt=""
      {...props}
      className={classnames([
        'usa-icon',
        {
          [`usa-icon--size-${size}`]: size !== undefined,
        },
        className,
      ])}
    />
  )
}
