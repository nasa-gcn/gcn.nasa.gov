import { login } from '~/lib/auth.server'
export const loader = () => login()
