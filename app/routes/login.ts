import type { LoaderFunction } from 'remix'
import { login } from '~/lib/auth.server'
export const loader: LoaderFunction = ({ request }) => login(request)
export default function () {
  return null
}

// FIXME: workaround for https://github.com/remix-run/remix/issues/1828.
// Resource routes (without browser code) don't get server pruning done.
// Once fixed upstream, remove.
export const meta = () => ({})
