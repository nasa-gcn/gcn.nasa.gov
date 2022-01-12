import type { LoaderFunction } from 'remix'
import { authorize } from '~/lib/auth.server'
export const loader: LoaderFunction = ({ request }) => authorize(request)
