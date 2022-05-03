/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { SideNav } from '@trussworks/react-uswds'
import { NavLink, Outlet } from 'remix'

export default function Docs() {
  return (
    <div className="grid-row grid-gap">
      <div className="desktop:grid-col-4">
        <SideNav
          items={[
            <NavLink key="gcnmissions" to="gcnmissions">
              Missions/Instruments/Facilities
            </NavLink>,
            <NavLink key="fermi" to="fermi">
              Fermi Gamma-ray Space Telescope
            </NavLink>,
            <NavLink key="swift" to="swift">
              Neil Gehrel's Swift Observatory
            </NavLink>,
            <NavLink key="lvk" to="lvk">
              LIGO/Virgo/KAGRA
            </NavLink>,
          ]}
        />
      </div>
      <div className="desktop:grid-col-8 usa-prose">
        <Outlet />
      </div>
    </div>
  )
}
