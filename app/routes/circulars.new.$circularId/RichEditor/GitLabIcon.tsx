/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import classNames from 'classnames'

import styles from './GitLabIcon.module.css'

export function GitLabIcon({
  src,
  className,
  style,
  ...props
}: { src: string } & JSX.IntrinsicElements['span']) {
  return (
    <span
      style={{
        maskImage: `url(${src})`,
        ...style,
      }}
      className={classNames(styles.icon, className)}
      {...props}
    />
  )
}
