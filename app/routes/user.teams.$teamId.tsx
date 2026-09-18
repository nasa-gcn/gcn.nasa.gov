/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { Form, redirect, useFetcher, useLoaderData } from '@remix-run/react'
import type { ModalRef } from '@trussworks/react-uswds'
import {
  Button,
  ButtonGroup,
  Grid,
  Icon,
  Label,
  Modal,
  ModalFooter,
  ModalHeading,
  ModalToggleButton,
  Select,
  Textarea,
} from '@trussworks/react-uswds'
import { useEffect, useRef, useState } from 'react'

import { getUser } from './_auth/user.server'
import Hint from '~/components/Hint'
import SegmentedCards from '~/components/SegmentedCards'
import Spinner from '~/components/Spinner'
import { ToolbarButtonGroup } from '~/components/ToolbarButtonGroup'
import { UserLookupComboBox } from '~/components/UserLookup'
import type {
  FullMemberInfo,
  Permission,
  TeamInviteWithEmail,
} from '~/lib/teams.server'
import {
  deleteTeamInvite,
  getTeam,
  getTeamMembership,
  getTeamTopics,
  inviteUserToTeam,
  removeUserFromTeam,
  setUsersTeamPermission,
  updateTeam,
  userIsTeamAdmin,
} from '~/lib/teams.server'
import { getFormDataString } from '~/lib/utils'

// import { useIsCurrentUser } from '~/root'

export async function action({
  request,
  params: { teamId },
}: ActionFunctionArgs) {
  if (!teamId) throw new Response(null, { status: 400 })
  const user = await getUser(request)

  if (!user) throw new Response(null, { status: 403 })
  const userIsAdmin = await userIsTeamAdmin(user.sub, teamId)
  const data = await request.formData()
  const intent = getFormDataString(data, 'intent')
  const permission = getFormDataString(data, 'permission')
  const sub = getFormDataString(data, 'sub')

  if (!intent) throw new Response(null, { status: 400 })
  switch (intent) {
    case 'update-permissions':
      if (!userIsAdmin || !sub || !permission)
        throw new Response(null, { status: 400 })
      await setUsersTeamPermission(sub, teamId, permission as Permission)
      break
    case 'remove-user':
      if (!userIsAdmin) throw new Response(null, { status: 400 })
      const userToRemove = getFormDataString(data, 'userToRemove')
      if (!userToRemove) throw new Response(null, { status: 400 })
      await removeUserFromTeam(userToRemove, teamId)
      break
    case 'leave-team':
      await removeUserFromTeam(user.sub, teamId)
      return redirect('/user/teams')
    case 'invite-user':
      if (!userIsAdmin) throw new Response(null, { status: 400 })
      const inviteeSub = getFormDataString(data, 'inviteeSub')
      if (!inviteeSub || !permission) throw new Response(null, { status: 400 })
      await inviteUserToTeam(user, teamId, inviteeSub, permission as Permission)
      break
    case 'delete-invite':
      if (!sub || !userIsAdmin) throw new Response(null, { status: 400 })
      await deleteTeamInvite(sub, teamId)
      break
    case 'update-description':
      if (!userIsAdmin) throw new Response(null, { status: 400 })
      const description = getFormDataString(data, 'description')
      if (!description) throw new Response(null, { status: 400 })
      await updateTeam(teamId, description)
    default:
      break
  }
  return null
}

export async function loader({
  params: { teamId },
  request,
}: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user) throw new Response(null, { status: 403 })
  if (!teamId) throw new Response(null, { status: 404 })
  const membership = await getTeamMembership(user.sub, teamId)
  if (!membership) throw new Response(null, { status: 403 })
  const team = await getTeam(teamId)
  const teamAdmin = await userIsTeamAdmin(user.sub, teamId)
  const topics = await getTeamTopics(teamId)
  return { team, teamAdmin, topics, sub: user.sub }
}

export default function () {
  const { team, teamAdmin, topics, sub } = useLoaderData<typeof loader>()
  const inviteRef = useRef<ModalRef>(null)
  const inviteFetcher = useFetcher()
  const descriptionFetcher = useFetcher()
  const [editMode, setEditMode] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [inviteeSub, setInviteeSub] = useState('')

  useEffect(() => {
    if (descriptionFetcher.state === 'idle' && submitting) {
      setSubmitting(false)
      setEditMode(false)
    }
  }, [descriptionFetcher.state, submitting])

  return (
    <>
      <Grid>
        <Grid row>
          <Grid tablet={{ col: 'fill' }}>
            <h1>{team.teamName}</h1>
          </Grid>
        </Grid>
        <h3>
          Description{' '}
          {teamAdmin && !editMode && (
            <Button type="button" unstyled onClick={() => setEditMode(true)}>
              Edit <Icon.Edit />
            </Button>
          )}
        </h3>
        {editMode ? (
          <descriptionFetcher.Form
            method="POST"
            onSubmit={() => setSubmitting(true)}
          >
            <input
              type="hidden"
              id="intent"
              name="intent"
              value="update-description"
            />
            <Textarea
              name="description"
              id="description"
              defaultValue={team.description}
              disabled={descriptionFetcher.state !== 'idle'}
            />
            <ButtonGroup>
              <Button
                type="button"
                onClick={() => setEditMode(false)}
                outline
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                Save Changes
              </Button>
              {submitting && (
                <span className="text-middle">
                  <Spinner />
                </span>
              )}
            </ButtonGroup>
          </descriptionFetcher.Form>
        ) : (
          <p>{team.description}</p>
        )}

        <h3>Topic</h3>
        <p>
          Members of this team can generate Kafka Client Credentials with
          permissions to read or write from topics starting with:{' '}
          <strong>{topics.map((x) => x.topicName)}</strong>.
        </p>
        {teamAdmin && (
          <>
            <h3>Admin Note</h3>
            <p>
              As an Admin of this team, you may manage the other users in this
              Team. This includes adding and removing users from the team,
              changing their permission to read or write to your teams available
              topics, and nominating another user as an Admin.
            </p>
          </>
        )}
        <h3>Team Members</h3>
        <SegmentedCards>
          {team.teamMembers.map((member) => (
            <MemberCard
              key={member.sub}
              member={member}
              teamAdmin={teamAdmin}
              currentUser={sub}
            />
          ))}
        </SegmentedCards>
        {teamAdmin && (
          <>
            <h3>Team Invites</h3>
            <ModalToggleButton opener modalRef={inviteRef} type="button">
              Invite
            </ModalToggleButton>
            {team.pendingInvites.length ? (
              <SegmentedCards>
                {team.pendingInvites.map((invite) => (
                  <InviteCard key={invite.sub} invite={invite} />
                ))}
              </SegmentedCards>
            ) : (
              <>No Pending Invites</>
            )}
          </>
        )}
      </Grid>
      <Modal
        id="modal-invite"
        ref={inviteRef}
        aria-labelledby="modal-invite-heading"
        aria-describedby="modal-invite-description"
        renderToPortal={false} // FIXME: https://github.com/trussworks/react-uswds/pull/1890#issuecomment-1023730448
      >
        <inviteFetcher.Form method="POST">
          <input type="hidden" name="intent" value="invite-user" />
          <input type="hidden" name="inviteeSub" value={inviteeSub} />
          <ModalHeading id="modal-invite-heading">
            Invite New Member to Team
          </ModalHeading>
          {/* Enter the user's email to invite them to join {team.teamName}. */}
          <Label htmlFor="user">User</Label>
          <UserLookupComboBox
            id="user"
            className="maxw-full"
            onSelectedItemChange={({ selectedItem }) =>
              setInviteeSub(selectedItem?.sub ?? '')
            }
          />
          <PermissionSelector defaultPermission="read" />

          <ModalFooter>
            <ModalToggleButton modalRef={inviteRef} closer outline>
              Cancel
            </ModalToggleButton>
            <Button data-close-modal type="submit">
              Send
            </Button>
          </ModalFooter>
        </inviteFetcher.Form>
      </Modal>
    </>
  )
}

function MemberCard({
  member,
  teamAdmin,
  currentUser,
}: {
  member: FullMemberInfo
  teamAdmin: Boolean
  currentUser: string
}) {
  const removeUserRef = useRef<ModalRef>(null)
  const editPermissionRef = useRef<ModalRef>(null)
  const leaveTeamRef = useRef<ModalRef>(null)

  const removeUserFetcher = useFetcher()
  const editPermissiionFetcher = useFetcher()

  const buttons = [
    teamAdmin && (
      <ModalToggleButton
        opener
        modalRef={editPermissionRef}
        type="button"
        className="usa-button--outline"
      >
        Edit
      </ModalToggleButton>
    ),
    currentUser === member.sub && (
      <ModalToggleButton
        opener
        modalRef={leaveTeamRef}
        type="button"
        className="usa-button--secondary"
      >
        Leave Team
      </ModalToggleButton>
    ),
    teamAdmin && !(currentUser === member.sub) && (
      <ModalToggleButton
        opener
        modalRef={removeUserRef}
        type="button"
        className="usa-button--secondary"
      >
        Remove
      </ModalToggleButton>
    ),
  ].filter((x) => x !== false)

  return (
    <>
      <Grid row>
        <div className="tablet:grid-col flex-fill">
          <div>
            <small>
              <strong>{member.username}</strong>
            </small>
          </div>
          <div>
            <small>{member.email}</small>
          </div>
          <div>
            <small>
              <strong>Permission:</strong> {member.permission}
            </small>
          </div>
        </div>
        <div className="tablet:grid-col flex-auto margin-y-auto">
          <ToolbarButtonGroup>{...buttons}</ToolbarButtonGroup>
        </div>
      </Grid>
      <Modal
        id="modal-delete"
        ref={removeUserRef}
        aria-labelledby="modal-delete-heading"
        aria-describedby="modal-delete-description"
        renderToPortal={false} // FIXME: https://github.com/trussworks/react-uswds/pull/1890#issuecomment-1023730448
      >
        <removeUserFetcher.Form method="POST">
          <input type="hidden" name="userToRemove" value={member.sub} />
          <input type="hidden" name="intent" value="remove-user" />
          <ModalHeading id="modal-delete-heading">
            Remove User From Team
          </ModalHeading>
          <p id="modal-delete-description">
            Are you sure that you want to remove {member.username} from this
            Team? They can always be added back in the future by a Team Admin.
          </p>
          <ModalFooter>
            <ModalToggleButton modalRef={removeUserRef} closer outline>
              Cancel
            </ModalToggleButton>
            <Button data-close-modal type="submit">
              Remove
            </Button>
          </ModalFooter>
        </removeUserFetcher.Form>
      </Modal>
      <Modal
        id="modal-update"
        ref={editPermissionRef}
        aria-labelledby="modal-update-heading"
        aria-describedby="modal-update-description"
        renderToPortal={false} // FIXME: https://github.com/trussworks/react-uswds/pull/1890#issuecomment-1023730448
      >
        <editPermissiionFetcher.Form method="POST">
          <input type="hidden" name="sub" value={member.sub} />
          <input type="hidden" name="intent" value="update-permissions" />
          <ModalHeading id="modal-update-heading">
            Update {member.username}'s Permission
          </ModalHeading>
          <div id="modal-update-description">
            <PermissionSelector defaultPermission={member.permission} />
          </div>

          <ModalFooter>
            <ModalToggleButton modalRef={removeUserRef} closer outline>
              Cancel
            </ModalToggleButton>
            <Button data-close-modal type="submit">
              Update
            </Button>
          </ModalFooter>
        </editPermissiionFetcher.Form>
      </Modal>
      <Modal
        id="modal-leave"
        ref={leaveTeamRef}
        aria-labelledby="modal-leave-heading"
        aria-describedby="modal-leave-description"
        renderToPortal={false} // FIXME: https://github.com/trussworks/react-uswds/pull/1890#issuecomment-1023730448
      >
        <Form method="POST">
          <input type="hidden" name="sub" value={member.sub} />
          <input type="hidden" name="intent" value="leave-team" />
          <ModalHeading id="modal-leave-heading">Leave Team</ModalHeading>
          <p id="modal-update-description">
            Area you sure you would like to leave this team? You can only be
            added back by a team admin with a new invite.
          </p>

          <ModalFooter>
            <ModalToggleButton modalRef={leaveTeamRef} closer outline>
              Cancel
            </ModalToggleButton>
            <Button data-close-modal type="submit">
              Confirm
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </>
  )
}

function PermissionSelector({
  defaultPermission,
}: {
  defaultPermission: string
}) {
  return (
    <>
      <Label htmlFor="permission">Select Permission Level</Label>
      <Select
        defaultValue={defaultPermission}
        id="permission"
        name="permission"
      >
        <option value="admin">Admin</option>
        <option value="write">Write</option>
        <option value="read">Read</option>
      </Select>
      <Hint>
        <ul>
          <li>
            Admin: Can manage users in this team and produce to and consume from
            this team's topic stream
          </li>
          <li>
            Write: Can produce to and consume from this team's topic stream
          </li>
          <li>Read: Can only consume messages from this team's topic stream</li>
        </ul>
      </Hint>
    </>
  )
}

function InviteCard({ invite }: { invite: TeamInviteWithEmail }) {
  const deleteInviteRef = useRef<ModalRef>(null)
  const deleteInviteFetcher = useFetcher()
  return (
    <>
      <Grid row>
        <div className="tablet:grid-col flex-fill">
          <div>
            <small>
              <strong>{invite.email}</strong>
            </small>
          </div>
          <div>
            <small>Permission: {invite.permission}</small>
          </div>
        </div>
        <div className="tablet:grid-col flex-auto margin-y-auto">
          <ToolbarButtonGroup>
            <ModalToggleButton
              opener
              modalRef={deleteInviteRef}
              type="button"
              className="usa-button--secondary"
            >
              Delete Invite
            </ModalToggleButton>
          </ToolbarButtonGroup>
        </div>
      </Grid>
      <Modal
        id="modal-delete-invite"
        ref={deleteInviteRef}
        aria-labelledby="modal-delete-invite-heading"
        aria-describedby="modal-delete-invite-description"
        renderToPortal={false} // FIXME: https://github.com/trussworks/react-uswds/pull/1890#issuecomment-1023730448
      >
        <deleteInviteFetcher.Form method="POST">
          <input type="hidden" name="sub" value={invite.sub} />
          <input type="hidden" name="intent" value="delete-invite" />
          <ModalHeading id="modal-delete-invite-heading">
            Remove User From Team
          </ModalHeading>
          <p id="modal-delete-invite-description">
            Are you sure that you want to delete the invite for {invite.email}{' '}
            from this Team?
          </p>
          <ModalFooter>
            <ModalToggleButton modalRef={deleteInviteRef} closer outline>
              Cancel
            </ModalToggleButton>
            <Button data-close-modal type="submit">
              Delete
            </Button>
          </ModalFooter>
        </deleteInviteFetcher.Form>
      </Modal>
    </>
  )
}
