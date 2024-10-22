/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { useSubmit } from '@remix-run/react'
import { Select } from '@trussworks/react-uswds'

import Pagination from './Pagination'

export default function PaginationSelectionFooter({
  page,
  totalPages,
  limit,
  query,
  form,
  view,
}: {
  page: number
  totalPages: number
  limit?: number
  query?: string
  form: string
  view?: string
}) {
  const submit = useSubmit()

  return (
    <div className="display-flex flex-row flex-wrap">
      <div className="display-flex flex-align-self-center margin-right-2 width-auto">
        <div>
          <input type="hidden" form={form} name="view" id="view" value={view} />
          <Select
            id="limit"
            title="Number of results per page"
            className="width-auto height-5 padding-y-0 margin-y-0"
            name="limit"
            value={limit}
            form={form}
            onChange={({ target: { form } }) => {
              submit(form)
            }}
          >
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
          </Select>
        </div>
      </div>
      <div className="display-flex flex-fill">
        {totalPages > 1 && (
          <Pagination
            query={query}
            page={page}
            limit={limit}
            totalPages={totalPages}
            view={view}
          />
        )}
      </div>
    </div>
  )
}
