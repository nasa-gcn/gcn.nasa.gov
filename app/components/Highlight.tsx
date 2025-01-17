/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Icon, Tooltip } from '@trussworks/react-uswds'
import classNames from 'classnames'
import hljs from 'highlight.js/lib/common'
import properties from 'highlight.js/lib/languages/properties'
import { useState } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'

hljs.registerLanguage('properties', properties)

export function Highlight({
  code,
  language,
  filename,
  className,
}: {
  code: string
  language: string
  filename?: string
  className?: string
}) {
  const [copyTooltip, setCopyTooltip] = useState('Copy')

  function copyTooltipTextHandler() {
    setCopyTooltip('Copied!')
    setTimeout(() => {
      setCopyTooltip('Copy')
    }, 3000)
  }

  return (
    <div className={classNames('position-relative', className)}>
      <div className="pin-right pin-top">
        {filename && (
          <Tooltip
            position="top"
            label={`Download ${filename}`}
            className="margin-top-1 margin-right-1 usa-button--unstyled"
          >
            <a download={filename} href={`data:,${encodeURIComponent(code)}`}>
              <Icon.FileDownload role="Presentation" />
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
              <Icon.ContentCopy role="presentation" />
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
