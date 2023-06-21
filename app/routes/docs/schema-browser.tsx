/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { type DataFunctionArgs, json } from '@remix-run/node'
import {
  Link,
  NavLink,
  Outlet,
  useFetcher,
  useLoaderData,
  useOutletContext,
} from '@remix-run/react'
import { Dropdown, Icon } from '@trussworks/react-uswds'
import { useEffect, useState } from 'react'

import { SideNav, SideNavSub } from '~/components/SideNav'
import Spinner from '~/components/Spinner'
import { feature } from '~/lib/env.server'
import type { GitContentDataResponse } from '~/lib/schema-data'
import { getGithubDir, getVersionRefs } from '~/lib/schema-data'

export type VersionContext = {
  selectedVersion: string
  setSelectedVersion: (val: string) => void
}

export async function loader({ request }: DataFunctionArgs) {
  if (!feature('SCHEMA')) throw new Response(null, { status: 404 })

  const searchParams = Object.fromEntries(new URL(request.url).searchParams)

  const versionRefs = await getVersionRefs()
  const version = searchParams.version ?? versionRefs[0].ref

  const smallTree = await getGithubDir(searchParams.path, version)

  return json({ versionRefs, version, smallTree })
}

export function useSideNavContext() {
  return useOutletContext<VersionContext>()
}

export default function Schema() {
  const { versionRefs, version, smallTree } = useLoaderData<typeof loader>()
  const versionFetcher = useFetcher<typeof loader>()

  const [selectedVersion, setSelectedVersion] = useState(version ?? 'main')
  const [smallItems] = useState(smallTree)

  return (
    <>
      <div className="grid-row grid-gap">
        <div className="desktop:grid-col-3">
          <Link to="/docs" className="margin-bottom-1">
            <div className="position-relative">
              <Icon.ArrowBack className="position-absolute top-0 left-0" />
            </div>
            <span className="padding-left-2">Back</span>
          </Link>
          <versionFetcher.Form method="GET">
            <Dropdown
              id="version"
              name="version"
              value={selectedVersion}
              onChange={(e) => {
                setSelectedVersion(e.target.value)
                const data = new FormData()
                data.set('version', e.target.value)
                versionFetcher.submit(data)
              }}
              disabled={versionFetcher.state !== 'idle'}
            >
              {versionRefs.map((x) => (
                <option key={x.name} value={x.ref}>
                  {x.name}
                </option>
              ))}
            </Dropdown>
          </versionFetcher.Form>
          <OnDemandGithubTree items={smallItems} version={selectedVersion} />
        </div>
        <div className="desktop:grid-col-9">
          <Outlet context={{ selectedVersion, setSelectedVersion }} />
        </div>
      </div>
    </>
  )
}

function OnDemandGithubTree({
  items,
  version,
}: {
  items: GitContentDataResponse[]
  version: string
}) {
  return (
    <SideNav
      items={items.map((x) => (
        <RenderSmallerTreeItem key={x.path} item={x} version={version} />
      ))}
    />
  )
}

function RenderSmallerTreeItem({
  item,
  version,
}: {
  item: GitContentDataResponse
  version: string
}): JSX.Element {
  const [showChildren, toggleShowChildren] = useState(false)
  const [childItems, setChildItems] = useState<GitContentDataResponse[]>([])
  const [loading, setIsLoading] = useState(false)
  const fetcher = useFetcher()

  useEffect(() => {
    function updateChildren() {
      const filteredChildren = fetcher.data.smallTree.filter(
        (childItem: GitContentDataResponse) =>
          !childItem.name.includes('.example.json')
      )
      setChildItems(filteredChildren)
    }
    if (fetcher.data && !childItems.length) {
      updateChildren()
      setIsLoading(false)
    }
  }, [childItems, fetcher.data, version])

  if (item.type != 'dir') {
    return renderNavLink(item, version, false)
  }

  return (
    <>
      <fetcher.Form>
        {renderNavLink(item, version, loading, () => {
          if (childItems.length == 0) {
            setIsLoading(true)
            const data = new FormData()
            data.set('path', item.path)
            data.set('version', version)
            fetcher.submit(data)
          }
          toggleShowChildren(!showChildren)
        })}
      </fetcher.Form>
      {childItems.length > 0 && (
        <SideNavSub
          base={item.path}
          items={childItems.map((x) => (
            <RenderSmallerTreeItem key={x.path} item={x} version={version} />
          ))}
          isVisible={showChildren}
        />
      )}
    </>
  )
}

function renderNavLink(
  item: GitContentDataResponse,
  version: string,
  loading: boolean,
  onClick?: () => void
): JSX.Element {
  const path = `${version}/${item.path}`
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
        {item.type == 'dir' && (
          <span className="margin-top-05 padding-right-05">
            <Icon.FolderOpen />
          </span>
        )}
        <span>{item.name}</span>
        <small className="margin-left-auto">{loading && <Spinner />}</small>
      </span>
    </NavLink>
  )
}
