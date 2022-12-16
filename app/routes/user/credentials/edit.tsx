/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import type { DataFunctionArgs } from '@remix-run/node'
import {
  handleCredentialActions,
  handleCredentialLoader,
  NewCredentialForm,
} from '~/components/NewCredentialForm'

export const handle = { breadcrumb: 'New', getSitemapEntries: () => null }

export const loader = handleCredentialLoader

export async function action({ request }: DataFunctionArgs) {
  return handleCredentialActions(request, 'user')
}

export default function Edit() {
  return <NewCredentialForm />
}
