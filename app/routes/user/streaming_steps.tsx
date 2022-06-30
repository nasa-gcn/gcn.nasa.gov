/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { useState } from 'react'
import { Outlet, useOutletContext } from '@remix-run/react'
import { NavStepIndicator } from '~/components/NavStepIndicator'

type ContextType = {
  codeSampleClientId?: string
  setCodeSampleClientId: (arg: string) => void
  codeSampleClientSecret?: string
  setCodeSampleClientSecret: (arg: string) => void
  noticeFormat: string
  setNoticeFormat: (arg: string) => void
  noticeTypes: string[]
  setNoticeTypes: (arg: string[]) => void
}

export default function Streaming() {
  const [noticeFormat, setNoticeFormat] = useState('')
  const defaultNoticeTypes: string[] = []
  const [noticeTypes, setNoticeTypes] = useState(defaultNoticeTypes)

  const [codeSampleClientId, setCodeSampleClientId] = useState('')
  const [codeSampleClientSecret, setCodeSampleClientSecret] = useState('')

  return (
    <>
      <NavStepIndicator
        counters="small"
        headingLevel="h4"
        steps={[
          { to: '.', label: 'Account Info' },
          { to: 'credentials', label: 'Select Credentials' },
          { to: 'alerts', label: 'Customize Alerts' },
          { to: 'code', label: 'Code Sample' },
        ]}
      />
      <Outlet
        context={{
          codeSampleClientId,
          setCodeSampleClientId,
          codeSampleClientSecret,
          setCodeSampleClientSecret,
          noticeFormat,
          setNoticeFormat,
          noticeTypes,
          setNoticeTypes,
        }}
      />
    </>
  )
}

export function useClient() {
  return useOutletContext<ContextType>()
}
