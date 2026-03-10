import { Link } from '@remix-run/react'

import { usePermissionModerator } from '~/root'

export function SendAnnouncementButton() {
  return (
    <>
      {usePermissionModerator() && (
        <Link className="usa-button usa-button--outline " to="/news/email">
          Send Announcement
        </Link>
      )}
    </>
  )
}
