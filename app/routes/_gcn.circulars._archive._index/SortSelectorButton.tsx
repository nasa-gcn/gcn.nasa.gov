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
  ...props
}: {
  sort?: string
} & Omit<Parameters<typeof ButtonGroup>[0], 'segmented' | 'children'>) {
  const slimClasses = 'height-4 padding-y-0'

  return (
    <ButtonGroup type="segmented" {...props}>
      <Button type="button" className={`${slimClasses} padding-x-2`}>
        Sort by...
      </Button>
      <Button type="button" className={`${slimClasses} padding-x-2`}>
        {<Icon.FilterList role="presentation" />}
      </Button>
    </ButtonGroup>
  )
}

export function SortSelector({
  sort = 'circularId',
  ...props
}: {
  sort?: string
}) {
  const [searchParams] = useSearchParams()

  const [inputSort, setSort] = useState(sort)

  const [showContent, setShowContent] = useState(false)

  const submit = useSubmit()

  function changeSort() {
    setShowContent(false)
    searchParams.set('sort', inputSort)
    submit(searchParams, {
      method: 'get',
      action: '/circulars',
    })
  }

  return (
    <>
      <SortButton
        sort={sort}
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
