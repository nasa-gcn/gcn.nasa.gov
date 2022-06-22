import type { FC } from 'react'
import { useState } from 'react'

type TabsContainerProps = {
  tabs: {
    label: string
    Component: React.ReactNode
  }[]
}

/**
 * Avalible Props
 * @param tabs Array of object with properties label: string and a Component: React.ReactNode
 */
let Tabs: FC<TabsContainerProps> = ({ tabs = [] }) => {
  const [selectedTab, setSelectedTab] = useState(0)
  const Panel = tabs && tabs[selectedTab]

  return (
    <div className="tabs-component">
      <div role="tablist">
        {tabs.map((tab, index) => (
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
            {tab.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        aria-labelledby={`btn-${selectedTab}`}
        id={`tabpanel-${selectedTab}`}
      >
        {Panel ? Panel.Component : null}
      </div>
    </div>
  )
}
export default Tabs
