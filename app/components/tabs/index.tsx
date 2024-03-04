/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Button, ButtonGroup, Grid } from '@trussworks/react-uswds'
import classNames from 'classnames'
import { type ReactElement, useState } from 'react'

import { ExclusiveOptionGroup, useExclusiveOption } from './exclusiveGroup'

import styles from './index.module.css'

/**
 * Tab button for use inside a {@link TabButtonGroup}.
 *
 * Use {@link TabButton} and {@link TabButtonGroup} when you need detailed
 * control over how the tab buttons are displayed or what actions are taken
 * when tabs are shown or hidden. If you just want tabs that switch between
 * views of several components, use {@link Tab} and {@link Tabs}.
 */
export function TabButton({
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

/**
 * Tab button group containing two or more {@link TabButton} components.
 *
 * Use {@link TabButton} and {@link TabButtonGroup} when you need detailed
 * control over how the tab buttons are displayed or what actions are taken
 * when tabs are shown or hidden. If you just want tabs that switch between
 * views of several components, use {@link Tab} and {@link Tabs}.
 */
export function TabButtonGroup({
  children,
  className,
  ...props
}: {
  children: Iterable<ReactElement<typeof TabButton>>
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

export interface TabProps {
  label: React.ReactNode
  children: React.ReactNode
}

/**
 * Tab with a label and child content for use inside a {@link Tabs} component.
 *
 * Use {@link TabButton} and {@link TabButtonGroup} when you need detailed
 * control over how the tab buttons are displayed or what actions are taken
 * when tabs are shown or hidden. If you just want tabs that switch between
 * views of several components, use {@link Tab} and {@link Tabs}.
 */
export function Tab({ children }: TabProps) {
  return <>{children}</>
}

/**
 * Tab container, holding two or more {@link Tab} components.
 *
 * Use {@link TabButton} and {@link TabButtonGroup} when you need detailed
 * control over how the tab buttons are displayed or what actions are taken
 * when tabs are shown or hidden. If you just want tabs that switch between
 * views of several components, use {@link Tab} and {@link Tabs}.
 */
export function Tabs({
  children,
}: {
  children: React.ReactElement<TabProps>[]
}) {
  const [selectedTab, setSelectedTab] = useState(0)

  return (
    <>
      <Grid
        row
        className={classNames(styles.tabs, 'flex-no-wrap overflow-x-scroll')}
      >
        <Grid
          col="auto"
          className="margin-bottom-05 border-primary border-bottom-2px width-1"
        />
        <Grid col="auto">
          <ButtonGroup role="tablist" type="segmented">
            {children.map((tab, index) => (
              <Button
                outline
                aria-selected={selectedTab === index}
                role="tab"
                type="button"
                className={classNames({
                  [styles.checked]: selectedTab === index,
                })}
                onClick={() => setSelectedTab(index)}
                key={index}
                aria-controls={`tabpanel-${index}`}
                id={`btn-${index}`}
              >
                {tab.props.label}
              </Button>
            ))}
          </ButtonGroup>
        </Grid>
        <Grid
          col="fill"
          className="margin-bottom-05 border-primary border-bottom-2px"
        />
      </Grid>
      <div
        role="tabpanel"
        aria-labelledby={`btn-${selectedTab}`}
        id={`tabpanel-${selectedTab}`}
      >
        {children && children[selectedTab]}
      </div>
    </>
  )
}
