import {
  Button,
  ButtonGroup,
  Dropdown,
  Label,
  StepIndicator,
  StepIndicatorStep,
  TextInput,
} from '@trussworks/react-uswds'
import { useState } from 'react'
import {
  GcnKafkaPythonSampleCode,
  GcnKafkaJsSampleCode,
} from '~/components/ClientSampleCode'
import type { Tab } from '~/components/Tabs'
import Tabs from '~/components/Tabs'
import ReCAPTCHA from 'react-google-recaptcha'

const steps = ['login', 'credentials', 'alerts', 'display']

type AlertSettings = {
  format: string
  noticeType: string
}

export default function Streaming() {
  const [activeStep, setActiveStep] = useState('login')
  const [newAlertFormat, setNewAlertFormat] = useState('')
  const [newAlertNoticeType, setNewAlertNoticeType] = useState('')
  const defaultArray: AlertSettings[] = []
  const [alertSettings, updateAlertSettings] = useState(defaultArray)
  const [disableStepButton, setDisableStepButton] = useState(false)

  const defaultName = ''
  const [name, setName] = useState(defaultName)
  const defaultScope = 'gcn.nasa.gov/kafka-public-consumer'
  const [scope, setScope] = useState(defaultScope)
  const siteKey = 'site-key'
  const [disableRequestButton, setDisableButton] = useState(false)

  const [codeSampleClientId, setCodeSampleClientId] = useState('')
  const [codeSampleClientSecret, setCodeSampleClientSecret] = useState('')

  // Step Indicator Methods
  function previousStep() {
    setActiveStep(steps[steps.indexOf(activeStep) - 1])
  }
  function nextStep() {
    setDisableStepButton(true)
    setActiveStep(steps[steps.indexOf(activeStep) + 1])
  }
  function getStatus(step: string) {
    if (step == activeStep) {
      return 'current'
    } else if (steps.indexOf(step) > steps.indexOf(activeStep)) {
      return 'incomplete'
    } else if (steps.indexOf(step) < steps.indexOf(activeStep)) {
      return 'complete'
    }
  }

  // Alert Management Methods
  function addNewAlertToList() {
    if (newAlertFormat && newAlertNoticeType) {
      var newAlert: AlertSettings = {
        format: newAlertFormat.toString(),
        noticeType: newAlertNoticeType.toString(),
      }
      updateAlertSettings([...alertSettings, newAlert])
      setDisableStepButton(false)
    } else {
      console.log('Must select both')
    }
  }
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
        setCodeSampleClientId(item.client_id)
        setCodeSampleClientSecret(item.client_secret)
        setDisableStepButton(false)
      })
  }
  function onChange(value: any) {
    if (value) {
      setDisableButton(false)
    } else {
      setDisableButton(true)
    }
  }

  function buildConnectionStrings() {
    return [
      'gcn.classic.text.FERMI_GBM_FIN_POS',
      'gcn.classic.text.LVC_INITIAL',
    ] //alertSettings.map(item => `"gcn.classic.${item.format}.${item.noticeType}"`)
  }

  function tabs(): Tab[] {
    return [
      {
        label: 'Python',
        Component: GcnKafkaPythonSampleCode({
          clientId: codeSampleClientId, //getClientId(),
          clientSecret: codeSampleClientSecret, //getClientSecret(),,
          subscriptionStrings: buildConnectionStrings(),
        }),
      },
      {
        label: 'Javscript',
        Component: GcnKafkaJsSampleCode({
          clientId: codeSampleClientId, //getClientId(),
          clientSecret: codeSampleClientSecret, //getClientSecret(),
        }),
      },
    ]
  }

  return (
    <>
      <StepIndicator counters="small" headingLevel="h4">
        <StepIndicatorStep label="Login/Sign Up" status={getStatus(steps[0])} />
        <StepIndicatorStep
          label="Generate Credentials"
          status={getStatus(steps[1])}
        />
        <StepIndicatorStep
          label="Customize Alerts"
          status={getStatus(steps[2])}
        />
        <StepIndicatorStep label="Code Sample" status={getStatus(steps[3])} />
      </StepIndicator>
      <div>
        {/* Step 1: Login */}
        {activeStep == steps[0] ? (
          <div className="usa-prose">
            <p>Keys are bound to your account.</p>
          </div>
        ) : null}

        {/* Step 2: Credential */}
        {activeStep == steps[1] ? (
          <div>
            <div>
              <div className="usa-prose">
                <p id="modal-new-description">
                  Choose a name for your new client credential.
                </p>
                <p className="text-base">
                  The name should help you remember what you use the client
                  credential for, or where you use it. Examples: “My Laptop”,
                  “Lab Desktop”, “GRB Pipeline”.
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
                    You are working in a development environment, the ReCaptcha
                    is currently hidden
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
        ) : null}

        {/* Step 3: Alerts */}
        {activeStep == steps[2] ? (
          <div>
            Choose how you would like your results returned. Select a Format and
            Notice type for each alert you would like to subscribe to.
            {alertSettings.length > 0
              ? alertSettings.map((item, key) => (
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
        ) : null}

        {/* Step 4: Code */}
        {activeStep == steps[3] ? (
          <div>
            <Tabs tabs={tabs()} />
          </div>
        ) : null}
      </div>
      <ButtonGroup type="default">
        {activeStep != steps[0] ? (
          <Button type="button" outline onClick={previousStep}>
            Back
          </Button>
        ) : null}
        {activeStep != steps[3] ? (
          <Button type="button" onClick={nextStep} disabled={disableStepButton}>
            Continue
          </Button>
        ) : null}
      </ButtonGroup>
    </>
  )
}
