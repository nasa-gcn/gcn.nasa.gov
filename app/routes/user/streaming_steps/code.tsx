/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import type { Tab } from '~/components/Tabs'
import Tabs from '~/components/Tabs'
import { ClientSampleCode } from '~/components/ClientSampleCode'
import { useClient } from '../streaming_steps'
import { Link } from '@remix-run/react'

export default function Code() {
  const clientData = useClient()

  function buildConnectionStrings() {
    return clientData.noticeTypes?.map(
      (item) => `'gcn.classic.${clientData.noticeFormat}.${item}'`
    )
  }

  function tabs(): Tab[] {
    return [
      {
        label: 'Python',
        Component: ClientSampleCode({
          clientId: clientData.codeSampleClientId,
          clientSecret: clientData.codeSampleClientSecret,
          noticeTypes: buildConnectionStrings(),
          language: 'python',
        }),
      },
      {
        label: 'Javscript',
        Component: ClientSampleCode({
          clientId: clientData.codeSampleClientId, //getClientId(),
          clientSecret: clientData.codeSampleClientSecret, //getClientSecret(),
          noticeTypes: buildConnectionStrings(),
          language: 'mjs',
        }),
      },
    ]
  }

  return (
    <>
      <Tabs tabs={tabs()} />
      <Link
        to="../alerts"
        type="button"
        className="usa-button usa-button--outline"
      >
        Back
      </Link>
    </>
  )
}
