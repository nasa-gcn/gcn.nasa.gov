/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { SideNav as BaseSideNav } from '@trussworks/react-uswds'
import type { To } from 'react-router'

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
  ...props
}: Omit<Parameters<typeof BaseSideNav>[0], 'isSubNav'> & { base: To }) {
  const isActive = useActiveLink({ to: base })
  return isActive ? <BaseSideNav {...props} isSubnav /> : <></>
}
