import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { getChangeRequests } from './_gcn.circulars/circulars.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const pendingCorrections = await getChangeRequests(1)
  console.log(pendingCorrections)
  return {
    something: 'stuff',
  }
}

export default function () {
  const data = useLoaderData<typeof loader>()
  console.log(data)
  return (
    <>
      <h1>Circulars</h1>
      <h2>Pending Corrections</h2>
    </>
  )
}
