/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { useSubmit } from '@remix-run/react'
import {
  Button,
  ButtonGroup,
  CardBody,
  Grid,
  Icon,
  Radio,
} from '@trussworks/react-uswds'
import { useState } from 'react'

import DetailsDropdownContent from '~/components/DetailsDropdownContent'

function SortButton({
  sort,
  expanded,
  ...props
}: {
  sort?: string
  expanded?: boolean
} & Omit<Parameters<typeof ButtonGroup>[0], 'segmented' | 'children'>) {
  const slimClasses = 'height-4 padding-y-0'

  return (
    <ButtonGroup type="segmented" {...props}>
      <Button type="button" className={`${slimClasses} padding-x-2`}>
        Sort by...
      </Button>
      <Button type="button" className={`${slimClasses} padding-x-2`}>
        {<Icon.FilterList role="presentation" />}
        {expanded ? (
          <Icon.ExpandLess role="presentation" />
        ) : (
          <Icon.ExpandMore role="presentation" />
        )}
      </Button>
    </ButtonGroup>
  )
}

type SortOrder = 'circularId' | 'relevance'

export function SortSelector({
  form,
  defaultValue,
}: {
  form?: string
  defaultValue?: SortOrder
}) {
  const [inputSort, setSort] = useState(defaultValue || '')

  const [showContent, setShowContent] = useState(false)

  const submit = useSubmit()

  const sortOptions = [
    { id: 'radio-sort-circularId', value: '', label: 'Circular' },
    { id: 'radio-sort-relevance', value: 'relevance', label: 'Relevance' },
  ]

  const SortRadioButtons = () => (
    <>
      {sortOptions.map(({ id, value, label }) => (
        <Radio
          key={id}
          id={id}
          name="sort"
          value={value}
          label={label}
          form={form}
          defaultChecked={inputSort === value}
          onChange={({ target: { form, value } }) => {
            setSort(value)
            setShowContent(false)
            submit(form)
          }}
        />
      ))}
    </>
  )

  return (
    <>
      <SortButton
        sort={defaultValue}
        expanded={showContent}
        onClick={() => {
          setShowContent((shown) => !shown)
        }}
      />
      {showContent && (
        <DetailsDropdownContent className="maxw-card-xlg">
          <CardBody>
            <Grid col={1}>
              <SortRadioButtons />
            </Grid>
          </CardBody>
        </DetailsDropdownContent>
      )}
    </>
  )
}
