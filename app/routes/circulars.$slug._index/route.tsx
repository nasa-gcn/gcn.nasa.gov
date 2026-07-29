import { type LoaderFunctionArgs, data, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { getEventTypeFromSlug } from '~/routes/circulars/circulars.lib'

export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params

  const eventType = slug ? getEventTypeFromSlug(slug) : undefined

  if (!eventType) {
    throw data(
      { message: `Archive category "${slug}" not found` },
      { status: 404 }
    )
  }

  return json({ slug, eventType })
}

export default function CircularArchiveResults() {
  const { slug, eventType } = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>Archive: {eventType}</h1>
      <p>Viewing results for path segment: {slug}</p>
    </div>
  )
}
