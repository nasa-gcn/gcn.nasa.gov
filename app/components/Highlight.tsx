/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import hljs from 'highlight.js'

export function Highlight({
  code,
  language,
}: {
  code: string
  language: string
}) {
  return (
    <pre>
      <code
        className={`hljs language-${language}`}
        dangerouslySetInnerHTML={{
          __html: hljs.highlight(code, { language }).value,
        }}
      />
    </pre>
  )
}
