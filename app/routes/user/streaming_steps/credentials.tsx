import { Button, Dropdown, Label, TextInput } from '@trussworks/react-uswds'
import { useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { useClient } from '../streaming_steps'

export default function Credentials() {
  const clientData = useClient()

  const defaultName = ''
  const [name, setName] = useState(defaultName)
  const defaultScope = 'gcn.nasa.gov/kafka-public-consumer'
  const [scope, setScope] = useState(defaultScope)
  const siteKey = 'site-key'
  const [disableRequestButton, setDisableButton] = useState(false)

  function handleCreate() {
    if (process.env.NODE_ENV === 'production') {
      var validationResponse = grecaptcha.getResponse()
      if (validationResponse === '') {
        // TODO: throw an error or something, for now return
        return
      }
    }
    fetch('/api/client_credentials', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, scope }),
    })
      .then((result) => result.json())
      .then((item) => {
        clientData.setCodeSampleClientId(item.client_id)
        clientData.setCodeSampleClientSecret(item.client_secret)
      })
  }
  function onChange(value: any) {
    if (value) {
      setDisableButton(false)
    } else {
      setDisableButton(true)
    }
  }

  return (
    <>
      <div>
        <div>
          <div className="usa-prose">
            <p id="modal-new-description">
              Choose a name for your new client credential.
            </p>
            <p className="text-base">
              The name should help you remember what you use the client
              credential for, or where you use it. Examples: “My Laptop”, “Lab
              Desktop”, “GRB Pipeline”.
            </p>
          </div>
          <Label htmlFor="name">Name</Label>
          <TextInput
            data-focus
            name="name"
            id="name"
            type="text"
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
          />
          <Label htmlFor="scope">Scope</Label>
          <Dropdown
            id="scope"
            name="scope"
            defaultValue={defaultScope}
            onChange={(e) => setScope(e.target.value)}
            onBlur={(e) => setScope(e.target.value)}
          >
            <option value="gcn.nasa.gov/kafka-public-consumer">
              gcn.nasa.gov/kafka-public-consumer
            </option>
          </Dropdown>
          <br />
          {process.env.NODE_ENV === 'production' ? (
            <ReCAPTCHA sitekey={siteKey} onChange={onChange}></ReCAPTCHA>
          ) : (
            <div className="usa-prose">
              <p className="text-base">
                You are working in a development environment, the ReCaptcha is
                currently hidden
              </p>
            </div>
          )}
          <br></br>
          <Button
            disabled={disableRequestButton}
            type="submit"
            onClick={handleCreate}
          >
            Request New Credentials
          </Button>
        </div>
      </div>
    </>
  )
}
