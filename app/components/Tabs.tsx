/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { useState } from 'react'

export interface TabProps {
  label: React.ReactNode
  children: React.ReactNode
}

export function Tab({ children }: TabProps) {
  return <>{children}</>
}

export function Tabs({
  children,
}: {
  children: React.ReactElement<TabProps>[]
}) {
  const [selectedTab, setSelectedTab] = useState(0)

  return (
    <div className="tabs-component">
      <div role="tablist">
        {children.map((tab, index) => (
          <button
            className={selectedTab === index ? 'active' : ''}
            onClick={() => setSelectedTab(index)}
            key={index}
            type="button"
            role="tab"
            aria-selected={selectedTab === index}
            aria-controls={`tabpanel-${index}`}
            tabIndex={selectedTab === index ? 0 : -1}
            id={`btn-${index}`}
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        aria-labelledby={`btn-${selectedTab}`}
        id={`tabpanel-${selectedTab}`}
      >
        {children && children[selectedTab]}
      </div>
    </div>
  )
}
