/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import {
  Button,
  IconContentCopy,
  IconFileDownload,
} from '@trussworks/react-uswds'
import hljs from 'highlight.js'
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
  return (
    <div className="position-relative">
      <div className="position-absolute pin-right pin-top">
        {filename && (
          <a
            download={filename}
            type="button"
            className="usa-button radius-0"
            href={`data:,${encodeURIComponent(code)}`}
          >
            Download {filename} <IconFileDownload />
          </a>
        )}
        <CopyToClipboard text={code}>
          <Button type="button" className="radius-0">
            Copy <IconContentCopy />
          </Button>
        </CopyToClipboard>
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
