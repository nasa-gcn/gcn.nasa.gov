/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { useSearchParams, useSubmit } from '@remix-run/react'
import {
  Button,
  ButtonGroup,
  CardBody,
  Grid,
  Icon,
} from '@trussworks/react-uswds'
import { useState } from 'react'

import DetailsDropdownContent from '~/components/DetailsDropdownContent'

function SortButton({
  sort,
  sortOrder,
  ...props
}: {
  sort?: string
  sortOrder?: string
} & Omit<Parameters<typeof ButtonGroup>[0], 'segmented' | 'children'>) {
  const slimClasses = 'height-4 padding-y-0'

  const sortOrderIcon: { [key: string]: JSX.Element } = {
    asc: <Icon.TrendingUp role="presentation" />,
    desc: <Icon.TrendingDown role="presentation" />,
  }

  return (
    <ButtonGroup type="segmented" {...props}>
      <Button type="button" className={`${slimClasses} padding-x-2`}>
        Sort by...
      </Button>
      <Button type="button" className={`${slimClasses} padding-x-2`}>
        {sortOrderIcon[sortOrder || 'desc']}
      </Button>
    </ButtonGroup>
  )
}

export function SortSelector({
  sort = 'circularId',
  sortOrder = 'desc',
  ...props
}: {
  sort?: string
  sortOrder?: string
}) {
  const [searchParams] = useSearchParams()

  const [inputSort, setSort] = useState(sort)
  // const [inputSortOrder, setSortOrder] = useState(sortOrder)

  const [showContent, setShowContent] = useState(false)

  const submit = useSubmit()

  function changeSort() {
    setShowContent(false)
    searchParams.set('sort', inputSort)
    // searchParams.set('sortOrder', inputSortOrder)
    submit(searchParams, {
      method: 'get',
      action: '/circulars',
    })
  }

  return (
    <>
      <SortButton
        sort={sort}
        // sortOrder={sortOrder}
        onClick={() => {
          setShowContent((shown) => !shown)
        }}
      />
      {showContent && (
        <DetailsDropdownContent className="maxw-card-xlg">
          <CardBody>
            <Grid col={1}>
              <Button
                type="button"
                className="usa-button usa-button--unstyled"
                value="circularID"
                onClick={(e) => {
                  setSort(e.currentTarget.value)
                  changeSort()
                }}
              >
                Circular ID
              </Button>
              <Button
                type="button"
                className="usa-button usa-button--unstyled"
                value="relevance"
                onClick={(e) => {
                  setSort(e.currentTarget.value)
                  changeSort()
                }}
              >
                Relevance
              </Button>
            </Grid>
          </CardBody>
        </DetailsDropdownContent>
      )}
    </>
  )
}
