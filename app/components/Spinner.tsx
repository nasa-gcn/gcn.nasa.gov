/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import classnames from 'classnames'

import loaderImage from '~/../node_modules/nasawds/src/img/loader.gif'

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
