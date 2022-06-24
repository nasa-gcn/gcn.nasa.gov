import {
  ButtonGroup,
  StepIndicator,
  StepIndicatorStep,
} from '@trussworks/react-uswds'
import { useState } from 'react'
import { Link, Outlet, useOutletContext } from '@remix-run/react'

const steps = ['login', 'credentials', 'alerts', 'display']

export type AlertSettings = {
  format: string
  noticeType: string
}

type ContextType = {
  codeSampleClientId?: string
  setCodeSampleClientId: (arg: string) => void
  codeSampleClientSecret?: string
  setCodeSampleClientSecret: (arg: string) => void
  alertSettings: AlertSettings[]
  setAlertSettings: (arg: AlertSettings[]) => void
}

export default function Streaming() {
  const [activeStep, setActiveStep] = useState('login')

  const defaultArray: AlertSettings[] = []
  const [alertSettings, setAlertSettings] = useState(defaultArray)

  const [codeSampleClientId, setCodeSampleClientId] = useState('')
  const [codeSampleClientSecret, setCodeSampleClientSecret] = useState('')

  function previousStep() {
    setActiveStep(steps[steps.indexOf(activeStep) - 1])
  }
  function nextStep() {
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

  return (
    <>
      <StepIndicator counters="small" headingLevel="h4">
        <StepIndicatorStep label="Account Info" status={getStatus(steps[0])} />
        <StepIndicatorStep
          label="Select Credentials"
          status={getStatus(steps[1])}
        />
        <StepIndicatorStep
          label="Customize Alerts"
          status={getStatus(steps[2])}
        />
        <StepIndicatorStep label="Code Sample" status={getStatus(steps[3])} />
      </StepIndicator>
      <Outlet
        context={{
          codeSampleClientId,
          setCodeSampleClientId,
          codeSampleClientSecret,
          setCodeSampleClientSecret,
          alertSettings,
          setAlertSettings,
        }}
      />
      <ButtonGroup type="default">
        {activeStep == steps[0] ? (
          <Link
            to="credentials"
            key="credentials"
            className="usa-button"
            onClick={nextStep}
          >
            Credentials
          </Link>
        ) : null}
        {activeStep == steps[1] ? (
          <>
            <Link
              to="."
              className="usa-button usa-button--outline"
              onClick={previousStep}
            >
              Back
            </Link>
            <Link
              to="alerts"
              key="alerts"
              className="usa-button"
              onClick={nextStep}
            >
              Alerts
            </Link>
          </>
        ) : null}
        {activeStep == steps[2] ? (
          <>
            <Link
              to="credentials"
              className="usa-button usa-button--outline"
              onClick={previousStep}
            >
              Back
            </Link>
            <Link
              to="code"
              key="code"
              className="usa-button"
              onClick={nextStep}
            >
              Generate Code
            </Link>
          </>
        ) : null}
        {activeStep == steps[3] ? (
          <Link
            to="alerts"
            className="usa-button usa-button--outline"
            onClick={previousStep}
          >
            Back
          </Link>
        ) : null}
      </ButtonGroup>
    </>
  )
}

export function useClient() {
  return useOutletContext<ContextType>()
}
