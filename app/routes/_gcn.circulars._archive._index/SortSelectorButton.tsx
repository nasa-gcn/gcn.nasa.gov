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

import DetailsDropdownContent from '~/components/DetailsDropdownContent'


const sortOptions = [
  { id: 'radio-sort-circularId', value: 'circularID', label: 'Circular' },
  { id: 'radio-sort-relevance', value: 'relevance', label: 'Relevance' },
]

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
        Sorted By {sortOptions.find((option) => option.value === sort)?.label || 'Circular'}
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

export function SortSelector({
  form,
  defaultValue,
}: {
  form?: string
  defaultValue?: string
}) {
  const [showContent, setShowContent] = useState(false)

  const sortInputRef = useRef<HTMLInputElement>(null)

  const submit = useSubmit()


  function radioOnChange({ target: { value } }: ChangeEvent<HTMLInputElement>) {
    if (sortInputRef.current) {
      sortInputRef.current.value = value
    }
    setShowContent(false)
    const form = sortInputRef.current?.form
    if (form) submit(form)
  }

  const SortRadioButtons = () => (
    <>
      {sortOptions.map(({ id, value, label }) => (
        <Radio
          key={id}
          id={id}
          name={''}
          value={value}
          label={label}
          form={form}
          defaultChecked={defaultValue === value}
          onChange={radioOnChange}
        />
      ))}
    </>
  )

  return (
    <>
      <input
        type="hidden"
        name="sort"
        form={form}
        ref={sortInputRef}
        defaultValue={defaultValue}
      />
      <SortButton
        sort={defaultValue}
        expanded={showContent}
        onClick={() => {
          setShowContent((shown) => !shown)
        }}
      />

      <DetailsDropdownContent
        className={classNames('maxw-card-xlg', {
          'display-none': !showContent,
        })}
      >
        <CardBody>
          <Grid col={1}>
            <SortRadioButtons />
          </Grid>
        </CardBody>
      </DetailsDropdownContent>
    </>
  )
}
