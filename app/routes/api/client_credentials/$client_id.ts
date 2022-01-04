import {
  ActionFunction
} from "remix"

import {
  ClientCredentialVendingMachine
} from "~/lib/ClientCredentialVendingMachine.server"

export const action: ActionFunction = async({params, request}) => {
  if (request.method != 'DELETE')
  {
    throw new Response('Method Not Allowed', { status: 405 })
  }
  const machine = await ClientCredentialVendingMachine.create(request)
  await machine.deleteClientCredential(params.client_id!)
  return null
}
