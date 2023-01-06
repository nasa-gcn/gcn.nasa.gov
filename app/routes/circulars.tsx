import { NavLink, useLoaderData } from '@remix-run/react'
import { SideNav } from '@trussworks/react-uswds'
import { Outlet } from 'react-router'

export async function loader() {
  const GCN_CIRCULARS_ENABLE = process.env['GCN_CIRCULARS_ENABLE']
  return { GCN_CIRCULARS_ENABLE }
}

export default function Circulars() {
  const { GCN_CIRCULARS_ENABLE } = useLoaderData<typeof loader>()
  return (
    <div className="grid-row grid-gap">
      {GCN_CIRCULARS_ENABLE ? (
        <div className="desktop:grid-col-3">
          <SideNav
            items={[
              <NavLink key="archive" to="archive">
                Archive
              </NavLink>,
              <NavLink key="." to="." end>
                Info
              </NavLink>,
              <NavLink key="submit" to="submit">
                Submit
              </NavLink>,
            ]}
          />
        </div>
      ) : null}
      <div
        className={GCN_CIRCULARS_ENABLE ? 'desktop:grid-col-9 usa-prose' : ''}
      >
        <Outlet />
      </div>
    </div>
  )
}
