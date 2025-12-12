/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { NavLink, Outlet } from '@remix-run/react'
import { GridContainer } from '@trussworks/react-uswds'

import { SideNav, SideNavSub } from '~/components/SideNav'
import { useFeature } from '~/root'
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
              <NavLink key="blackcat" to="blackcat">
                BlackCAT
              </NavLink>,
              <NavLink key="calet" to="calet">
                CALET
              </NavLink>,
              useFeature('CHIME') && (
                <NavLink key="chime" to="chime">
                  CHIME
                </NavLink>
              ),
              useFeature('DSA110') && (
                <NavLink key="dsa110" to="dsa110">
                  DSA-110
                </NavLink>
              ),
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
              useFeature('KM3NET') && (
                <NavLink key="km3net" to="km3net">
                  KM3NeT
                </NavLink>
              ),
              <NavLink key="konus" to="konus">
                Konus-Wind
              </NavLink>,
              <NavLink key="lvk" to="lvk">
                LIGO/Virgo/KAGRA
              </NavLink>,
              <NavLink key="maxi" to="maxi">
                MAXI
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
              <>
                <NavLink key="archive" to="archive">
                  Archive
                </NavLink>
                <SideNavSub
                  base="archive"
                  items={[
                    <NavLink key="agile" to="archive/agile">
                      AGILE
                    </NavLink>,
                    <NavLink key="burstcube" to="archive/burstcube">
                      BurstCube
                    </NavLink>,
                    <NavLink key="integral" to="archive/integral">
                      INTEGRAL
                    </NavLink>,
                    <NavLink key="moa" to="archive/moa">
                      MOA
                    </NavLink>,
                  ]}
                />
              </>,
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
