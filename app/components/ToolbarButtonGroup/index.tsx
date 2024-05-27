/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { ButtonGroup } from '@trussworks/react-uswds'
import classNames from 'classnames'

import styles from './index.module.css'

/**
 * A segmented button group with some styling appropriate for toolbars.
 *
 * - Do not wrap the text within buttons.
 */
export function ToolbarButtonGroup({
  className,
  ...props
}: Omit<Parameters<typeof ButtonGroup>[0], 'type'>) {
  return (
    <ButtonGroup
      className={classNames(className, 'flex-auto', styles.toolbar)}
      {...props}
    />
  )
}
