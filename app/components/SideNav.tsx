/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Link } from '@remix-run/react'
import { SideNav as BaseSideNav } from '@trussworks/react-uswds'

import { useActiveLink } from '~/lib/remix'

export function SideNav(props: Parameters<typeof BaseSideNav>[0]) {
  return (
    <div className="position-sticky top-0">
      <BaseSideNav {...props} />
    </div>
  )
}

export function SideNavSub({
  base,
  isVisible,
  ...props
}: Omit<Parameters<typeof BaseSideNav>[0], 'isSubNav'> & {
  base: Parameters<typeof Link>[0]['to']
  isVisible?: boolean
}) {
  const isActive = useActiveLink({ to: base })
  return isActive || isVisible ? <BaseSideNav {...props} isSubnav /> : <></>
}
