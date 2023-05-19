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
          /* special case grid length for 'Baksan Neutrino Observatory Alert' */
          <li
            key={keyword}
            className={keyword.length < 20 ? 'grid-col-2' : 'grid-col-6'}
          >
            {keyword}
          </li>
        ))}
      </ul>
      <h3>Disallowed subject keywords</h3>
      <ul className="grid-row usa-list usa-list--unstyled">
        {emailAutoReplyChecklist.map((keyword) => (
          <li key={keyword} className={'grid-col-3'}>
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
