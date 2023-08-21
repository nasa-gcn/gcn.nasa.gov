/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Icon, Tooltip } from '@trussworks/react-uswds'
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
      <div className="pin-right pin-top">
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
            <span>
              <Icon.ContentCopy />
            </span>
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
