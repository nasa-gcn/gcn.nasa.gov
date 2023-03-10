/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { AppData, SerializeFrom } from '@remix-run/node'
import { useRouteLoaderData as useRouteLoaderDataRR } from 'react-router'

// FIXME: Remove once https://github.com/remix-run/remix/pull/5157 is merged
export function useRouteLoaderData<T = AppData>(
  routeId: string
): SerializeFrom<T> {
  return useRouteLoaderDataRR(routeId) as SerializeFrom<T>
}
