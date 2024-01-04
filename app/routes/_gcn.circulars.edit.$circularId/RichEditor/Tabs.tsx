/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Button, ButtonGroup } from '@trussworks/react-uswds'
import classNames from 'classnames'
import { type ReactElement } from 'react'

import { ExclusiveOptionGroup, useExclusiveOption } from './exclusiveGroup'

import styles from './Tabs.module.css'

export function Tab({
  defaultChecked,
  className,
  onClick,
  ...props
}: { defaultSelected?: boolean } & Omit<
  Parameters<typeof Button>[0],
  'outline' | 'type'
>) {
  const [checked, setChecked] = useExclusiveOption(defaultChecked)
  return (
    <Button
      outline
      type="button"
      className={classNames(className, { [styles.checked]: checked })}
      onClick={(e) => {
        setChecked()
        onClick?.(e)
      }}
      {...props}
    />
  )
}

export function TabBar({
  children,
}: {
  children: Iterable<ReactElement<typeof Tab>>
}) {
  return (
    <ExclusiveOptionGroup>
      <ButtonGroup type="segmented" className={styles.tabs}>
        {children}
      </ButtonGroup>
    </ExclusiveOptionGroup>
  )
}
