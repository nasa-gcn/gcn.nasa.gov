import { Link } from '@remix-run/react'

import { useModStatus } from '~/root'

export function SendAnnouncmentButton() {
  const userIsMod = useModStatus()
  return (
    <>
      {userIsMod && (
        <Link className="usa-button usa-button--outline " to="/news/email">
          Send Announcement
        </Link>
      )}
    </>
  )
}
