import type { ActionFunctionArgs } from '@remix-run/node'

import { getUser } from './_auth/user.server'
import type { UserLookup } from '~/components/UserLookup'
import { listUsers, listUsersInGroup } from '~/lib/cognito.server'
import { getFormDataString } from '~/lib/utils'

export async function action({ request }: ActionFunctionArgs) {
  const user = await getUser(request)
  if (!user) throw new Response(null, { status: 403 })
  const data = await request.formData()
  const filter = getFormDataString(data, 'filter')
  const groupFilter = getFormDataString(data, 'group')
  console.log('filter: ', filter)
  console.log('group: ', groupFilter)
  let users: UserLookup[] = []

  if (filter?.length) {
    if (groupFilter) {
      users = (await listUsersInGroup(groupFilter)).map((x) => {
        return {
          sub: x.Attributes?.find((x) => x.Name == 'sub')?.Value,
          email: x.Attributes?.find((x) => x.Name == 'email')?.Value ?? '',
          name: x.Attributes?.find((x) => x.Name == 'name')?.Value,
          affiliation: x.Attributes?.find((x) => x.Name == 'affilitation')
            ?.Value,
        }
      })
    } else {
      users = await listUsers(filter)
      console.log(users)
    }
    users
      .filter(
        ({ name, email }) =>
          email !== undefined &&
          (name?.includes(filter) || email?.includes(filter))
      )
      .slice(0, 5)
  }

  return {
    users,
  }
}
