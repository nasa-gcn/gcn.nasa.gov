import type { LoaderFunction } from 'remix'
import { authorize } from '~/auth.server'

export const loader: LoaderFunction = ({request}) =>
(
  authorize(request)
)
