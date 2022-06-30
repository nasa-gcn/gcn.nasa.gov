/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { useMatches } from '@remix-run/react'
import { StepIndicator, StepIndicatorStep } from '@trussworks/react-uswds'
import { resolvePath } from 'react-router'

type StepIndicatorProps = Parameters<typeof StepIndicator>[0]
type StepIndicatorStepProps = Parameters<typeof StepIndicatorStep>[0]

interface NavStepIndicatorStepProps extends StepIndicatorStepProps {
  to: string
}

interface NavStepIndicatorProps extends Omit<StepIndicatorProps, 'children'> {
  steps: NavStepIndicatorStepProps[]
}

/* A step indicator that knows about what step we are on based on the URL. */
export function NavStepIndicator({ steps, ...props }: NavStepIndicatorProps) {
  const [{ pathname: parentPathname }, { pathname: childPathname }] =
    useMatches().slice(-2)

  const activeStepIndex = steps.findIndex(({ to }) => {
    const { pathname: stepPathname } = resolvePath(to, parentPathname)
    return (
      childPathname === stepPathname || childPathname === `${stepPathname}/`
    )
  })

  function getStatus(index: number) {
    if (index < activeStepIndex) {
      return 'complete'
    } else if (index === activeStepIndex) {
      return 'current'
    } else {
      return 'incomplete'
    }
  }

  return (
    <StepIndicator {...props}>
      {steps.map(({ label }, index) => (
        <StepIndicatorStep
          label={label}
          key={index}
          status={getStatus(index)}
        />
      ))}
    </StepIndicator>
  )
}
