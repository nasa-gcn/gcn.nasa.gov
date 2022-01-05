import type { LoaderFunction } from 'remix'
import { login } from '~/lib/auth.server'
export const loader: LoaderFunction = ({request}) => login(request)
