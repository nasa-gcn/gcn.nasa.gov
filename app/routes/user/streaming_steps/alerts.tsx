import { Button, Dropdown, Form, Label } from '@trussworks/react-uswds'
import React from 'react'
import { NoticeFormat } from '~/components/NoticeFormat'
import { useClient } from '../streaming_steps'

type NoticeSettings = {
  noticeFormat: { value: string }
  noticeTypes: { value: string[] }
}

export default function Alerts() {
  const clientData = useClient()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const target = event.target as typeof event.target & NoticeSettings
    clientData.setNoticeFormat(target.noticeFormat.value)
    const noticeTypes: string[] = target.noticeTypes.value
    clientData.setNoticeTypes(noticeTypes) // To be updated with nested chechbox thing
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
          <Dropdown id="noticeTypes" name="noticeTypes">
            <option>- Select - </option>
            <option value="FERMI_GBM_ALERT">FERMI_GBM_ALERT</option>
            <option value="FERMI_GBM_FLT_POS">FERMI_GBM_FLT_POS</option>
            <option value="FERMI_GBM_GND_POS">FERMI_GBM_GND_POS</option>
            <option value="FERMI_GBM_FIN_POS">FERMI_GBM_FIN_POS</option>
            <option value="FERMI_GBM_SUBTHRESH">FERMI_GBM_SUBTHRESH</option>
            <option value="FERMI_LAT_POS_INI">FERMI_LAT_POS_INI</option>
            <option value="FERMI_LAT_POS_UPD">FERMI_LAT_POS_UPD</option>
            <option value="FERMI_LAT_GND">FERMI_LAT_GND</option>
            <option value="FERMI_LAT_OFFLINE">FERMI_LAT_OFFLINE</option>
            <option value="FERMI_LAT_TRANS">FERMI_LAT_TRANS</option>
            <option value="FERMI_LAT_MONITOR">FERMI_LAT_MONITOR</option>
          </Dropdown>
          <Button type="submit">Generate Code</Button>
        </Form>
      </div>
    </>
  )
}
