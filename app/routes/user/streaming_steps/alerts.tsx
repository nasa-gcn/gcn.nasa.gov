/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { Link } from '@remix-run/react'
import { Label } from '@trussworks/react-uswds'
import React from 'react'
import { NoticeFormat } from '~/components/NoticeFormat'
import { NoticeTypeCheckboxes } from '~/components/NoticeTypeCheckboxes'
import { useClient } from '../streaming_steps'

export default function Alerts() {
  const clientData = useClient()

  function handleSubmit(
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) {
    if (
      document.querySelectorAll('input[name="noticeFormat"]:checked') ==
      undefined
    ) {
      return //error, type is required
    }
    const noticeFormat = document.querySelectorAll(
      'input[name="noticeFormat"]:checked'
    )[0].id
    clientData.setNoticeFormat(noticeFormat)
    let noticeTypes: string[] = []
    // Might be a better way to do this, but need to exclude the 'parent' option, unless it works as a valid option
    const checkedOptions = document.querySelectorAll(
      '.sub-option input[type="checkbox"]:checked'
    )
    for (let index = 0; index < checkedOptions.length; index++) {
      noticeTypes.push(checkedOptions[index].id)
    }
    clientData.setNoticeTypes(noticeTypes)
  }

  return (
    <>
      <div>
        Choose how you would like your results returned. Select a Format and
        Notice type for each alert you would like to subscribe to.
        <br />
        <NoticeFormat name="noticeFormat"></NoticeFormat>
        <Label htmlFor="noticeTypes">Notice Type</Label>
        <NoticeTypeCheckboxes />
        <Link
          to="../credentials"
          type="button"
          className="usa-button usa-button--outline"
        >
          Back
        </Link>
        <Link
          to="../code"
          type="button"
          className="usa-button"
          onClick={handleSubmit}
        >
          Generate Code
        </Link>
      </div>
    </>
  )
}
