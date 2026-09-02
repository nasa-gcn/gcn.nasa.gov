/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useFetcher, useLoaderData } from '@remix-run/react'
import type { ModalRef } from '@trussworks/react-uswds'
import {
  Button,
  Grid,
  Modal,
  ModalFooter,
  ModalHeading,
  ModalToggleButton,
} from '@trussworks/react-uswds'
import { useRef } from 'react'

import { getUser } from '../_auth/user.server'
import SegmentedCards from '~/components/SegmentedCards'
import { ToolbarButtonGroup } from '~/components/ToolbarButtonGroup'
import type { Team, TeamInvite } from '~/lib/teams.server'
import {
  acceptTeamInvite,
  deleteTeamInvite,
  getInvitesForUser,
  getUsersTeams,
} from '~/lib/teams.server'
import { getFormDataString } from '~/lib/utils'
import { usePermissionAdmin } from '~/root'
import type { SEOHandle } from '~/root/seo'

export const handle: SEOHandle = { noIndex: true }

export async function action({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user) throw new Response(null, { status: 403 })
  const data = await request.formData()
  const teamId = getFormDataString(data, 'teamId')
  if (!teamId) throw new Response(null, { status: 400 })
  const intent = getFormDataString(data, 'intent')
  switch (intent) {
    case 'accept':
      await acceptTeamInvite(user.sub, teamId)
      break
    case 'decline':
      await deleteTeamInvite(user.sub, teamId)
      break
  }
  return null
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user) throw new Response(null, { status: 403 })
  const teams = await getUsersTeams(user.sub)
  const invites = await getInvitesForUser(user)
  return { teams, invites }
}

export default function () {
  const { teams, invites } = useLoaderData<typeof loader>()
  const userIsAdmin = usePermissionAdmin()
  return (
    <>
      <h1>Teams</h1>
      <p>
        Teams are a groups of users who have access to specific Kafka Topics.
        New teams can only be created by an administrator as part of the Kafka
        Producer onboarding process. If you do not see your team here, please{' '}
        <Link to="/contact">contact us</Link>.
      </p>
      {userIsAdmin && (
        <Link to="/user/teams/new" className="usa-button usa-button--outline">
          Create New Team
        </Link>
      )}
      <SegmentedCards>
        {teams.map((team) => (
          <TeamCard key={team.teamId} team={team} />
        ))}
      </SegmentedCards>
      {invites.length > 0 && (
        <>
          <h2>Pending Invites</h2>
          <SegmentedCards>
            {invites.map((invite) => (
              <InviteCard key={invite.teamId} invite={invite} />
            ))}
          </SegmentedCards>
        </>
      )}
    </>
  )
}

function TeamCard({ team }: { team: Team }) {
  return (
    <>
      <Grid row>
        <div className="tablet:grid-col flex-fill">
          <div>
            <small>
              <strong>{team.teamName}</strong>{' '}
            </small>
          </div>
          <div>
            <small>Description: {team.description}</small>
          </div>
        </div>
        <div className="tablet:grid-col flex-auto margin-y-auto">
          <ToolbarButtonGroup>
            <Link
              to={team.teamId}
              type="button"
              className="usa-button usa-button--outline"
            >
              View
            </Link>
          </ToolbarButtonGroup>
        </div>
      </Grid>
    </>
  )
}

function InviteCard({ invite }: { invite: TeamInvite & { teamName: string } }) {
  const declineRef = useRef<ModalRef>(null)
  const fetcher = useFetcher()
  return (
    <>
      <Grid row>
        <div className="tablet:grid-col flex-fill">
          <div>
            <small>
              You've been invited to join the team {invite.teamName}.
            </small>
          </div>
        </div>
        <div className="tablet:grid-col flex-auto margin-y-auto">
          <ToolbarButtonGroup>
            <ModalToggleButton
              opener
              modalRef={declineRef}
              type="button"
              className="usa-button--secondary"
            >
              Decline
            </ModalToggleButton>
            <fetcher.Form method="post">
              <input type="hidden" name="teamId" value={invite.teamId} />
              <input type="hidden" name="intent" value="accept" />
              <Button type="submit">Accept</Button>
            </fetcher.Form>
          </ToolbarButtonGroup>
        </div>
      </Grid>
      <Modal
        id="modal-delete"
        ref={declineRef}
        aria-labelledby="modal-delete-heading"
        aria-describedby="modal-delete-description"
        renderToPortal={false} // FIXME: https://github.com/trussworks/react-uswds/pull/1890#issuecomment-1023730448
      >
        <ModalHeading id="modal-delete-heading">Decline Invite</ModalHeading>
        <p id="modal-delete-description">
          Are you sure that you want to decline this invite?
        </p>
        <fetcher.Form method="post">
          <ModalFooter>
            <ModalToggleButton modalRef={declineRef} closer outline>
              Cancel
            </ModalToggleButton>
            <input type="hidden" name="intent" value="decline" />
            <input type="hidden" name="teamId" value={invite.teamId} />

            <Button data-close-modal type="submit">
              Delete
            </Button>
          </ModalFooter>
        </fetcher.Form>
      </Modal>
    </>
  )
}
