/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Button, Icon } from '@trussworks/react-uswds'
import type { ReactNode } from 'react'
import { useState } from 'react'
import type { ReactElement } from 'rehype-react/lib'

/**
 * An expand/collapse component for form field information.
 */
export default function CollapsableInfo({
  id,
  preambleText,
  buttonText,
  children,
}: {
  id: string
  preambleText: ReactElement | string
  buttonText: string
  children: ReactNode
}) {
  const [showContent, toggleShowContent] = useStateToggle(false)

  return (
    <div className="text-base margin-bottom-1" id={id}>
      <small>
        {preambleText}{' '}
        <Button
          unstyled
          type="button"
          className="usa-link"
          aria-expanded={showContent}
          onClick={toggleShowContent}
        >
          <small>
            {buttonText}&nbsp;
            {showContent ? (
              <Icon.ExpandLess role="presentation" />
            ) : (
              <Icon.ExpandMore role="presentation" />
            )}
          </small>
        </Button>
      </small>
      {showContent && (
        <div className="text-base padding-x-2 padding-bottom-2 text-pre-wrap">
          {children}
        </div>
      )}
    </div>
  )
}

function useStateToggle(value: boolean) {
  const [state, setState] = useState(value)

  function toggle() {
    setState((state) => !state)
  }

  return [state, toggle] as const
}
