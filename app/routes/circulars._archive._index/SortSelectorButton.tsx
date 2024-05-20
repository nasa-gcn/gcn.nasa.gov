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
import classNames from 'classnames'
import type { ChangeEvent } from 'react'
import { useRef, useState } from 'react'
import { useOnClickOutside } from 'usehooks-ts'

import DetailsDropdownContent from '~/components/DetailsDropdownContent'

const sortOptions = { circularID: 'Date', relevance: 'Relevance' }

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
        Sort by{' '}
        {sortOptions[sort as keyof typeof sortOptions] ||
          sortOptions.circularID}
      </Button>
      <Button type="button" className={`${slimClasses} padding-x-2`}>
        <Icon.FilterList role="presentation" />
        {expanded ? (
          <Icon.ExpandLess role="presentation" />
        ) : (
          <Icon.ExpandMore role="presentation" />
        )}
      </Button>
    </ButtonGroup>
  )
}

export function SortSelector({
  form,
  defaultValue,
}: {
  form?: string
  defaultValue?: string
}) {
  const submit = useSubmit()
  const SortSelectorRef = useRef<HTMLDivElement>(null)
  const [showSortSelector, setShowSortSelector] = useState(false)
  useOnClickOutside(SortSelectorRef, () => {
    setShowSortSelector(false)
  })

  function radioOnChange({ target }: ChangeEvent<HTMLInputElement>) {
    setShowSortSelector(false)
    if (target.form) submit(target.form)
  }

  const sanitizedValue =
    defaultValue && defaultValue in sortOptions ? defaultValue : 'circularID'

  const SortRadioButtons = () => (
    <>
      {Object.entries(sortOptions).map(([value, label]) => (
        <Radio
          key={value}
          id={value}
          name="sort"
          value={value}
          label={label}
          form={form}
          defaultChecked={sanitizedValue === value}
          onChange={radioOnChange}
        />
      ))}
    </>
  )

  return (
    <div ref={SortSelectorRef}>
      <SortButton
        sort={sanitizedValue}
        expanded={showSortSelector}
        onClick={() => {
          setShowSortSelector((shown) => !shown)
        }}
      />

      <DetailsDropdownContent
        className={classNames('maxw-card-xlg', {
          'display-none': !showSortSelector,
        })}
      >
        <CardBody>
          <Grid col={1}>
            <SortRadioButtons />
          </Grid>
        </CardBody>
      </DetailsDropdownContent>
    </div>
  )
}
