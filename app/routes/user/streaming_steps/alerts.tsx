import { Button, Dropdown, Label } from '@trussworks/react-uswds'
import { useState } from 'react'
import type { AlertSettings } from '../streaming_steps'
import { useClient } from '../streaming_steps'

export default function Alerts() {
  const clientData = useClient()
  const [newAlertFormat, setNewAlertFormat] = useState('')
  const [newAlertNoticeType, setNewAlertNoticeType] = useState('')
  function addNewAlertToList() {
    if (newAlertFormat && newAlertNoticeType) {
      var newAlert: AlertSettings = {
        format: newAlertFormat.toString(),
        noticeType: newAlertNoticeType.toString(),
      }
      clientData.setAlertSettings([...clientData.alertSettings, newAlert])
      //setDisableStepButton(false)
    } else {
      console.log('Must select both')
    }
  }

  return (
    <>
      <div>
        Choose how you would like your results returned. Select a Format and
        Notice type for each alert you would like to subscribe to.
        {clientData.alertSettings.length > 0
          ? clientData.alertSettings.map((item, key) => (
              <p key={key}>
                {item.format} - {item.noticeType}
              </p>
            ))
          : null}
        <Label htmlFor="options">Format</Label>
        <Dropdown
          id="input-dropdown"
          name="input-dropdown"
          onChange={(e) => setNewAlertFormat(e.target.value)}
        >
          <option>- Select - </option>
          <option value="binary">Binary</option>
          <option value="voevent">VO Event</option>
          <option value="text">Text</option>
        </Dropdown>
        <Label htmlFor="options">Notice Type</Label>
        <Dropdown
          id="input-dropdown"
          name="input-dropdown"
          onChange={(e) => setNewAlertNoticeType(e.target.value)}
        >
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
        <br />
        <Button type="button" onClick={addNewAlertToList}>
          Add
        </Button>
      </div>
    </>
  )
}
