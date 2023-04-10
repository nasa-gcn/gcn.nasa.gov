/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { AppData, SerializeFrom } from '@remix-run/node'
import type { NavLinkProps } from '@remix-run/react'
import { useContext } from 'react'
import {
  UNSAFE_NavigationContext as NavigationContext,
  useLocation,
  useResolvedPath,
  useRouteLoaderData as useRouteLoaderDataRR,
} from 'react-router'

// FIXME: Remove once https://github.com/remix-run/remix/pull/5157 is merged
export function useRouteLoaderData<T = AppData>(
  routeId: string
): SerializeFrom<T> {
  return useRouteLoaderDataRR(routeId) as SerializeFrom<T>
}

/** Hook version of active link test from react-router's NavLink.
 * Adapted from https://github.com/remix-run/react-router/blob/main/packages/react-router-dom/index.tsx.
 */
export function useActiveLink({
  to,
  caseSensitive = false,
  end = false,
  relative,
}: Pick<NavLinkProps, 'to' | 'caseSensitive' | 'end' | 'relative'>) {
  let path = useResolvedPath(to, { relative })
  let location = useLocation()
  let { navigator } = useContext(NavigationContext)

  let toPathname = navigator.encodeLocation
    ? navigator.encodeLocation(path).pathname
    : path.pathname
  let locationPathname = location.pathname

  if (!caseSensitive) {
    locationPathname = locationPathname.toLowerCase()
    toPathname = toPathname.toLowerCase()
  }

  let isActive =
    locationPathname === toPathname ||
    (!end &&
      locationPathname.startsWith(toPathname) &&
      locationPathname.charAt(toPathname.length) === '/')

  return isActive
}
