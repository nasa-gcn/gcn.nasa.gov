import {
  login
} from '~/auth.server'

export async function loader()
{
  return login()
}
