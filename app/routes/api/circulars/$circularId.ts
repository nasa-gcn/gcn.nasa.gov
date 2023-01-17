import type { DataFunctionArgs } from '@remix-run/node'
import { get } from '~/routes/circulars/circulars.server'

export async function loader({ params: { circularId } }: DataFunctionArgs) {
  return await handleCircularLoader(circularId)
}

/** Returns a single Circular from the provided circularId
 *
 * Throws an error if circularId is undefined
 */
export async function handleCircularLoader(circularId: string | undefined) {
  if (!circularId)
    throw new Response('circularId must be defined', { status: 400 })
  return get(parseInt(circularId))
}
