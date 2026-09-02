/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
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

export async function action({
  request,
  params: { teamId },
}: ActionFunctionArgs) {
  if (!teamId) throw new Response(null, { status: 400 })
  const user = await getUser(request)
  if (!user || !(await userIsTeamAdmin(user.sub, teamId)))
    throw new Response(null, { status: 403 })
  const data = await request.formData()
  const intent = getFormDataString(data, 'intent')
  const permission = getFormDataString(data, 'permission')
  const sub = getFormDataString(data, 'sub')

  if (!intent) throw new Response(null, { status: 400 })
  switch (intent) {
    case 'update-permissions':
      if (!sub || !permission) throw new Response(null, { status: 400 })
      await setUsersTeamPermission(sub, teamId, permission as Permission)
      break
    case 'remove-user':
      const userToRemove = getFormDataString(data, 'userToRemove')
      if (!userToRemove) throw new Response(null, { status: 400 })
      await removeUserFromTeam(userToRemove, teamId)
      break
    case 'invite-user':
      const inviteeSub = getFormDataString(data, 'inviteeSub')
      if (!inviteeSub || !permission) throw new Response(null, { status: 400 })
      await inviteUserToTeam(user, teamId, inviteeSub, permission as Permission)
      break
    case 'delete-invite':
      if (!sub) throw new Response(null, { status: 400 })
      await deleteTeamInvite(sub, teamId)
      break
    case 'update-description':
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
  const { team, teamAdmin, topics } = useLoaderData<typeof loader>()
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
          permissions to read or write from topics starting with{' '}
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
              topic={topics.find((x) => x.topicId == member.topicId)?.topicName}
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
  topic,
  teamAdmin,
}: {
  member: FullMemberInfo
  teamAdmin: Boolean
  topic?: string
}) {
  const removeUserRef = useRef<ModalRef>(null)
  const editPermissionRef = useRef<ModalRef>(null)

  const removeUserFetcher = useFetcher()
  const editPermissiionFetcher = useFetcher()

  return (
    <>
      <Grid row>
        <div className="tablet:grid-col flex-fill">
          <div>
            <small>
              <strong>{member.username}</strong>
            </small>
          </div>
          {member.affiliation && (
            <div>
              <small>{member.affiliation}</small>
            </div>
          )}
          <div>
            <small>{member.email}</small>
          </div>
          <div>
            <small>
              <strong>Topic:</strong> {topic}
            </small>
          </div>
          <div>
            <small>
              <strong>Permission:</strong> {member.permission}
            </small>
          </div>
        </div>
        {teamAdmin && (
          <div className="tablet:grid-col flex-auto margin-y-auto">
            <ToolbarButtonGroup>
              <ModalToggleButton
                opener
                modalRef={editPermissionRef}
                type="button"
              >
                Edit
              </ModalToggleButton>
              <ModalToggleButton
                opener
                modalRef={removeUserRef}
                type="button"
                className="usa-button--secondary"
              >
                <Icon.Delete role="presentation" className="margin-y-neg-2px" />
                Remove
              </ModalToggleButton>
            </ToolbarButtonGroup>
          </div>
        )}
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
          <p id="modal-update-description">
            Topic: {topic}
            <PermissionSelector defaultPermission={member.permission} />
          </p>

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
              <Icon.Delete role="presentation" className="margin-y-neg-2px" />
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
