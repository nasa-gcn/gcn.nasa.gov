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
  'outline' | 'role' | 'type'
>) {
  const [checked, setChecked] = useExclusiveOption(defaultChecked)
  return (
    <Button
      {...props}
      outline
      aria-selected={checked}
      role="tab"
      type="button"
      className={classNames(className, { [styles.checked]: checked })}
      onClick={(e) => {
        setChecked()
        onClick?.(e)
      }}
    />
  )
}

export function TabBar({
  children,
  className,
  ...props
}: {
  children: Iterable<ReactElement<typeof Tab>>
} & Omit<
  Parameters<typeof ButtonGroup>[0],
  'children' | 'role' | 'segmented' | 'type'
>) {
  return (
    <ExclusiveOptionGroup>
      <ButtonGroup
        {...props}
        role="tablist"
        type="segmented"
        className={classNames(styles.tabs, className)}
      >
        {children}
      </ButtonGroup>
    </ExclusiveOptionGroup>
  )
}
