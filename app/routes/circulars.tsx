import { NavLink } from '@remix-run/react'
import { SideNav } from '@trussworks/react-uswds'
import { Outlet } from 'react-router'

export default function Circulars() {
  return (
    <>
      <div className="grid-row grid-gap">
        <div className="desktop:grid-col-3">
          <SideNav
            items={[
              <NavLink key="." to="." end>
                Archive
              </NavLink>,
              <NavLink key="info" to="info">
                Info
              </NavLink>,
              <NavLink key="submit" to="submit">
                Submit
              </NavLink>,
            ]}
          />
        </div>
        <div className="desktop:grid-col-9 usa-prose">
          <Outlet />
        </div>
      </div>
    </>
  )
}
