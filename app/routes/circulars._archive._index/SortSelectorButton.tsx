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
import { forwardRef } from 'react'

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

interface SortSelectorProps {
  form?: string
  defaultValue?: string
  showContent: boolean
  setShowContent: React.Dispatch<React.SetStateAction<boolean>>
}

export const SortSelector = forwardRef<HTMLDivElement, SortSelectorProps>(
  function SortSelector(
    { form, defaultValue, showContent, setShowContent },
    ref: React.Ref<HTMLDivElement>
  ) {
    // const [showContent, setShowContent] = useState(false)

    const submit = useSubmit()

    function radioOnChange({ target }: ChangeEvent<HTMLInputElement>) {
      setShowContent(false)
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
      <div ref={ref}>
        <SortButton
          sort={sanitizedValue}
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
      </div>
    )
  }
)
