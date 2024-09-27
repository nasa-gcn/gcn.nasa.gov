/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { NavLink, Outlet } from '@remix-run/react'
import { GridContainer } from '@trussworks/react-uswds'

import { SideNav } from '~/components/SideNav'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle = { breadcrumb: 'Missions' }

export default function () {
  return (
    <GridContainer className="usa-section">
      <div className="grid-row grid-gap">
        <div className="desktop:grid-col-4">
          <SideNav
            items={[
              <NavLink key="." to="." end>
                Missions, Instruments, and Facilities
              </NavLink>,
              <NavLink key="agile" to="agile">
                AGILE
              </NavLink>,
              <NavLink key="burstcube" to="burstcube">
                BurstCube
              </NavLink>,
              <NavLink key="calet" to="calet">
                CALET
              </NavLink>,
              <NavLink key="einstein-probe" to="einstein-probe">
                Einstein Probe
              </NavLink>,
              <NavLink key="fermi" to="fermi">
                Fermi Gamma-ray Space Telescope
              </NavLink>,
              <NavLink key="gecam" to="gecam">
                GECAM
              </NavLink>,
              <NavLink key="hawc" to="hawc">
                HAWC
              </NavLink>,
              <NavLink key="icecube" to="icecube">
                IceCube Neutrino Observatory
              </NavLink>,
              <NavLink key="integral" to="integral">
                INTEGRAL
              </NavLink>,
              <NavLink key="konus" to="konus">
                Konus-Wind
              </NavLink>,
              <NavLink key="lvk" to="lvk">
                LIGO/Virgo/KAGRA
              </NavLink>,
              <NavLink key="maxi" to="maxi">
                MAXI
              </NavLink>,
              <NavLink key="moa" to="moa">
                MOA
              </NavLink>,
              <NavLink key="swift" to="swift">
                Neil Gehrels Swift Observatory
              </NavLink>,
              <NavLink key="snews" to="snews">
                SNEWS
              </NavLink>,
              <NavLink key="sksn" to="sksn">
                Super-Kamiokande
              </NavLink>,
              <NavLink key="svom" to="svom">
                SVOM
              </NavLink>,
            ]}
          />
        </div>
        <div className="desktop:grid-col-8 grid-col-12">
          <Outlet />
        </div>
      </div>
    </GridContainer>
  )
}
