/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { Button, Icon, Tooltip } from '@trussworks/react-uswds'
import hljs from 'highlight.js/lib/common'
import { useState } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'

export function Highlight({
  code,
  language,
  filename,
}: {
  code: string
  language: string
  filename?: string
}) {
  const [copyTooltip, setCopyTooltip] = useState('Copy')

  function copyTooltipTextHandler() {
    setCopyTooltip('Copied!')
    setTimeout(() => {
      setCopyTooltip('Copy')
    }, 3000)
  }

  return (
    <div className="position-relative">
      <div className="position-absolute pin-right pin-top">
        {filename && (
          <Tooltip
            position="top"
            label={'Download ' + filename}
            className="margin-top-1 margin-right-1 usa-button--unstyled"
          >
            <a download={filename} href={`data:,${encodeURIComponent(code)}`}>
              <Icon.FileDownload />
            </a>
          </Tooltip>
        )}
        <Tooltip
          position="top"
          label={copyTooltip}
          className="margin-top-1 margin-right-1 usa-button--unstyled"
        >
          <CopyToClipboard text={code} onCopy={copyTooltipTextHandler}>
            <Button type="button" className="radius-0" unstyled>
              <Icon.ContentCopy />
            </Button>
          </CopyToClipboard>
        </Tooltip>
      </div>
      <pre>
        <code
          className={`hljs language-${language}`}
          dangerouslySetInnerHTML={{
            __html: hljs.highlight(code, { language }).value,
          }}
        />
      </pre>
    </div>
  )
}
