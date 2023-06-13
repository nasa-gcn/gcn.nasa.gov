/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { NavLink, Outlet, useLoaderData } from '@remix-run/react'
import { Button, Icon } from '@trussworks/react-uswds'
import dirTree from 'directory-tree'
import { useEffect, useState } from 'react'

import { useSideNavContext } from '../docs'
import { SideNav, SideNavSub } from '~/components/SideNav'
import { feature } from '~/lib/env.server'

// Schema treeItem
type SchemaTreeItem = {
  name: string
  path: string
  children?: SchemaTreeItem[]
}

export async function loader() {
  if (!feature('SCHEMA')) throw new Response(null, { status: 404 })
  const localDataTree = dirTree(
    '../../node_modules/@nasa-gcn/schema/gcn/notices'
  )

  return { localDataTree }
}

export default function Schema() {
  const { localDataTree } = useLoaderData<typeof loader>()
  const { showSideNav, setShowSideNav } = useSideNavContext()

  const items: React.ReactNode[] = ([localDataTree] as SchemaTreeItem[])
    .filter((x) => !x.name.includes('.example.json'))
    .map(RenderSchemaTreeItem)

  useEffect(() => {
    setShowSideNav(false)
  }, [setShowSideNav])

  return (
    <>
      <Button
        type="button"
        onClick={() => setShowSideNav(!showSideNav)}
        className="margin-bottom-1"
        unstyled
      >
        <div className="position-relative">
          <Icon.ArrowBack className="position-absolute top-0 left-0" />
        </div>
        <span className="padding-left-2">
          {showSideNav ? 'Hide' : 'Show'} Docs Nav
        </span>
      </Button>

      <div className="grid-row grid-gap">
        <div className="desktop:grid-col-3">
          <SideNav items={items} />
        </div>
        <div className="desktop:grid-col-9">
          <Outlet />
        </div>
      </div>
    </>
  )
}

function filterOutExampleChildren(childrenArray: SchemaTreeItem[]) {
  return childrenArray?.filter(
    (childItem) => !childItem.name.includes('.example.json')
  )
}

function renderNavLink(
  item: SchemaTreeItem,
  onClick?: () => void
): React.ReactNode {
  const path = formatPath(item.path)
  return (
    <NavLink
      key={path}
      to={path}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <span className="display-flex flex-align-center">
        {item.children && item.children.length > 0 && (
          <span className="margin-top-05 padding-right-05">
            <Icon.FolderOpen />
          </span>
        )}
        <span>{item.name}</span>
        <small className="margin-left-auto">
          {filterOutExampleChildren(item.children ?? []).length > 0
            ? filterOutExampleChildren(item.children ?? []).length
            : ''}
        </small>
      </span>
    </NavLink>
  )
}

function RenderSchemaTreeItem(item: SchemaTreeItem) {
  const [showChildren, toggleShowChildren] = useState(false)

  if (!item.children || item.children.length === 0) {
    return renderNavLink(item)
  }

  const filteredChildren = item.children.filter(
    (childItem) => !childItem.name.includes('.example.json')
  )

  const childNodes = filteredChildren.map((childItem) =>
    RenderSchemaTreeItem(childItem)
  )

  return (
    <>
      {renderNavLink(item, () => {
        toggleShowChildren(!showChildren)
      })}
      <SideNavSub
        base={formatPath(item.path)}
        items={childNodes}
        isVisible={showChildren}
      />
    </>
  )
}

function formatPath(path: string) {
  return path
    .replaceAll('\\', '/')
    .replace('node_modules/@nasa-gcn/schema', 'docs/schema-browser')
}
