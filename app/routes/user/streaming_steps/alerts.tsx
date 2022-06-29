import { Button, Form, Label } from '@trussworks/react-uswds'
import React from 'react'
import { NoticeFormat } from '~/components/NoticeFormat'
import { NoticeTypeCheckboxes } from '~/components/NoticeTypeCheckboxes'
import { useClient } from '../streaming_steps'

type NoticeSettings = {
  noticeFormat: { value: string }
}

export default function Alerts() {
  const clientData = useClient()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const target = event.target as typeof event.target & NoticeSettings
    clientData.setNoticeFormat(target.noticeFormat.value)
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
        {clientData.alertSettings.length > 0
          ? clientData.alertSettings.map((item, key) => (
              <p key={key}>
                {item.format} - {item.noticeType}
              </p>
            ))
          : null}
        <Form onSubmit={(event) => handleSubmit(event)}>
          <NoticeFormat name="noticeFormat"></NoticeFormat>
          <Label htmlFor="noticeTypes">Notice Type</Label>
          <NoticeTypeCheckboxes />
          <Button type="submit">Generate Code</Button>
        </Form>
      </div>
    </>
  )
}
