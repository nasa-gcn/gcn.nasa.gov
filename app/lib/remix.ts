/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { type NavLinkProps, useMatch, useResolvedPath } from '@remix-run/react'

/** Hook version of active link test from react-router's NavLink.
 * Adapted from https://github.com/remix-run/react-router/blob/main/packages/react-router-dom/index.tsx.
 */
export function useActiveLink({
  to,
  caseSensitive = false,
  end = false,
  relative,
}: Pick<NavLinkProps, 'to' | 'caseSensitive' | 'end' | 'relative'>) {
  const path = useResolvedPath(to, { relative }).pathname
  return Boolean(useMatch({ path, caseSensitive, end }))
}
