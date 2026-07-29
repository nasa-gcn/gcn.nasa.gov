import { type LoaderFunctionArgs, data, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { getEventTypeFromSlug } from '~/routes/circulars/circulars.lib'

export async function loader({ params }: LoaderFunctionArgs) {
  const { eventType: eventTypeSlug } = params

  const resolvedEventType = eventTypeSlug
    ? getEventTypeFromSlug(eventTypeSlug)
    : undefined

  if (!resolvedEventType) {
    throw data(
      { message: `Archive category "${eventTypeSlug}" not found` },
      { status: 404 }
    )
  }

  return json({
    eventTypeSlug,
    resolvedEventType,
  })
}

export default function CircularArchiveResults() {
  const { eventTypeSlug, resolvedEventType } = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>event type: {resolvedEventType}</h1>
      <p>Slug used in URL: {eventTypeSlug}</p>
    </div>
  )
}
