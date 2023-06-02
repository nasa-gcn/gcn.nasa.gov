/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { Link } from '@remix-run/react'

import {
  emailAutoReplyChecklist,
  validSubjectKeywords,
} from '~/routes/circulars/circulars.lib'

export function CircularsKeywords() {
  return (
    <>
      <h3>Allowed subject keywords</h3>
      <ul className="grid-row usa-list usa-list--unstyled">
        {validSubjectKeywords.map((keyword) => (
          <li key={keyword} className={getKeywordClassName(keyword.length)}>
            {keyword}
          </li>
        ))}
      </ul>
      <h3>Disallowed subject keywords</h3>
      <ul className="grid-row usa-list usa-list--unstyled">
        {emailAutoReplyChecklist.map((keyword) => (
          <li key={keyword} className={'tablet:grid-col-3'}>
            {keyword}
          </li>
        ))}
      </ul>
      <p className="usa-paragraph">
        <Link to="/contact">Contact us</Link> to add new keywords.
      </p>
    </>
  )
}

function getKeywordClassName(length: number) {
  let className = 'tablet:'
  if (length < 16) className += 'grid-col-2 grid-col-4'
  else if (length < 32) className += 'grid-col-4 grid-col-8'
  else className += 'grid-col-6'
  return className
}
