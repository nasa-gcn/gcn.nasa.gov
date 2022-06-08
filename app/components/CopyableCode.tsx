/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { Button, IconContentCopy } from '@trussworks/react-uswds'

import CopyToClipboard from 'react-copy-to-clipboard'

export interface CopyableCodeProps {
  text: string
}

export function CopyableCode(props: CopyableCodeProps) {
  return (
    <CopyToClipboard text={props.text}>
      <Button
        type="button"
        unstyled
        className="padding-1px text-base-darkest"
        title="Copy to clipboard"
      >
        <IconContentCopy />{' '}
        <code>
          <small>{props.text}</small>
        </code>
      </Button>
    </CopyToClipboard>
  )
}
