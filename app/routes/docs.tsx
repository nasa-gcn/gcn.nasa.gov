import { SideNav } from '@trussworks/react-uswds'
import { NavLink, Outlet } from 'remix'

export default function Docs() {
  return (
    <div className="grid-row grid-gap">
      <div className="desktop:grid-col-3">
        <SideNav
          items={[
            <NavLink key="client" to="client">
              Client Configuration
            </NavLink>,
            <NavLink key="contributing" to="contributing">
              Contributing
            </NavLink>,
            <NavLink key="changes" to="changes">
              Change Log
            </NavLink>,
          ]}
        />
      </div>
      <div className="desktop:grid-col-9 usa-prose">
        <Outlet />
      </div>
    </div>
  )
}
