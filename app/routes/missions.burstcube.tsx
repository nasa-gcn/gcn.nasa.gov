import { redirect } from '@remix-run/react'

export async function loader() {
  return redirect('../archival/burstcube')
}
