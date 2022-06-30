import { StepIndicator, StepIndicatorStep } from '@trussworks/react-uswds'
import { useState } from 'react'
import { Outlet, useOutletContext } from '@remix-run/react'

export const steps = ['login', 'credentials', 'alerts', 'display']

type ContextType = {
  codeSampleClientId?: string
  setCodeSampleClientId: (arg: string) => void
  codeSampleClientSecret?: string
  setCodeSampleClientSecret: (arg: string) => void
  noticeFormat: string
  setNoticeFormat: (arg: string) => void
  noticeTypes: string[]
  setNoticeTypes: (arg: string[]) => void
  activeStep: string
  setActiveStep: (arg: string) => void
}

export default function Streaming() {
  const [activeStep, setActiveStep] = useState(steps[0])

  const [noticeFormat, setNoticeFormat] = useState('')
  const defaultNoticeTypes: string[] = []
  const [noticeTypes, setNoticeTypes] = useState(defaultNoticeTypes)

  const [codeSampleClientId, setCodeSampleClientId] = useState('')
  const [codeSampleClientSecret, setCodeSampleClientSecret] = useState('')

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
          noticeFormat,
          setNoticeFormat,
          noticeTypes,
          setNoticeTypes,
          activeStep,
          setActiveStep,
        }}
      />
    </>
  )
}

export function useClient() {
  return useOutletContext<ContextType>()
}
