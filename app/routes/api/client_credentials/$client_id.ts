import { ActionFunction } from 'remix'

import { ClientCredentialVendingMachine } from '~/lib/ClientCredentialVendingMachine.server'

export const action: ActionFunction = async ({ params, request }) => {
  if (request.method != 'DELETE') throw new Response(null, { status: 405 })
  if (!params.client_id) throw new Response('params.client_id must be defined')

  const machine = await ClientCredentialVendingMachine.create(request)
  await machine.deleteClientCredential(params.client_id)
  return null
}

// FIXME: workaround for https://github.com/remix-run/remix/issues/1828.
// Resource routes (without browser code) don't get server pruning done.
// Once fixed upstream, remove.
export const meta = () => ({})
