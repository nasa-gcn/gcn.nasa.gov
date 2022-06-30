import type { ActionFunction } from '@remix-run/node'
import { ClientCredentialVendingMachine } from '~/routes/user/client_credentials.server'

export const action: ActionFunction = async ({ request }) => {
  const [machine, body] = await Promise.all([
    ClientCredentialVendingMachine.create(request),
    request.json(),
  ])
  return await machine.getClientCredential(body.clientId)
}
