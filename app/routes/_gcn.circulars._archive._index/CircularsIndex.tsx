/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from '@remix-run/react'

import type { Circular } from '../_gcn.circulars/circulars.lib'
import { formatDateISO } from '../_gcn.circulars/circulars.lib'
import { useFeature } from '~/root'

export default function ({
  allItems,
  searchString,
  totalItems,
  query,
}: {
  allItems: Circular[]
  searchString: string
  totalItems: number
  query?: string
}) {
  const featureCircularsTableFormat = useFeature('CIRCULARS_TABLE_FORMAT')
  return (
    <>
      {query && (
        <h3>
          {totalItems} result{totalItems != 1 && 's'} found.
        </h3>
      )}
      {!featureCircularsTableFormat && (
        <ol>
          {allItems.map(({ circularId, subject }) => (
            <li key={circularId} value={circularId}>
              <Link
                className="usa-link"
                to={`/circulars/${circularId}${searchString}`}
              >
                {subject}
              </Link>
            </li>
          ))}
        </ol>
      )}

      {featureCircularsTableFormat && (
        <div className="usa-table-container--scrollable" tabIndex={0}>
          <table
            className="usa-table usa-table--striped usa-table--borderless"
            data-sortable
          >
            <thead>
              <tr>
                <th scope="col" role="columnheader" data-sortable>
                  Circular ID
                </th>
                <th scope="col" role="columnheader" data-sortable>
                  Subject
                </th>
                <th scope="col" role="columnheader" data-sortable>
                  Created On
                </th>
              </tr>
            </thead>
            <tbody>
              {allItems.map(({ circularId, subject, createdOn }) => (
                <tr key={circularId}>
                  <td data-sort-value={circularId}>{circularId}</td>
                  <td data-sort-value={subject}>
                    <Link
                      className="usa-link"
                      to={`/circulars/${circularId}${searchString}`}
                    >
                      {subject}
                    </Link>
                  </td>
                  <td data-sort-value={createdOn}>
                    {formatDateISO(createdOn)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            className="usa-sr-only usa-table__announcement-region"
            aria-live="polite"
          ></div>
        </div>
      )}
    </>
  )
}
