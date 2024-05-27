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
  CardFooter,
  DateRangePicker,
  Grid,
  Icon,
  Radio,
} from '@trussworks/react-uswds'
import classNames from 'classnames'
import { type ChangeEvent, useRef, useState } from 'react'
import { useOnClickOutside } from 'usehooks-ts'

import DetailsDropdownContent from '~/components/DetailsDropdownContent'

const dateSelectorLabels: Record<string, string> = {
  hour: 'Last Hour',
  today: 'Today',
  day: 'Last Day',
  week: 'Last Week',
  month: 'Last Month',
  year: 'Last Year',
  ytd: 'Year to Date',
}

function DateSelectorButton({
  startDate,
  endDate,
  expanded,
  ...props
}: {
  startDate?: string
  endDate?: string
  expanded?: boolean
} & Omit<Parameters<typeof ButtonGroup>[0], 'segmented' | 'children'>) {
  const slimClasses = 'padding-y-1'

  return (
    <ButtonGroup type="segmented" {...props}>
      <Button type="button" className={`${slimClasses} padding-x-2`}>
        {(startDate && dateSelectorLabels[startDate]) ||
          (startDate && endDate && (
            <>
              {startDate}—{endDate}
            </>
          )) ||
          (startDate && <>After {startDate}</>) ||
          (endDate && <>Before {endDate}</>) ||
          'Filter by date'}
      </Button>
      <Button type="button" className={`${slimClasses} padding-x-1`}>
        <Icon.CalendarToday role="presentation" />
        {expanded ? (
          <Icon.ExpandLess role="presentation" />
        ) : (
          <Icon.ExpandMore role="presentation" />
        )}
      </Button>
    </ButtonGroup>
  )
}

export function DateSelector({
  form,
  defaultStartDate,
  defaultEndDate,
}: {
  form?: string
  defaultStartDate?: string
  defaultEndDate?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [showContent, setShowContent] = useState(false)
  useOnClickOutside(ref, () => {
    setShowContent(false)
  })
  const defaultShowDateRange = Boolean(
    (defaultStartDate && !dateSelectorLabels[defaultStartDate]) ||
      defaultEndDate
  )
  const [showDateRange, setShowDateRange] = useState(defaultShowDateRange)
  const startDateInputRef = useRef<HTMLInputElement>(null)
  const endDateInputRef = useRef<HTMLInputElement>(null)
  const submit = useSubmit()

  function setStartDate(value: string) {
    if (startDateInputRef.current) startDateInputRef.current.value = value
  }

  function setEndDate(value: string) {
    if (endDateInputRef.current) endDateInputRef.current.value = value
  }

  function radioOnChange({ target: { value } }: ChangeEvent<HTMLInputElement>) {
    setShowDateRange(false)
    setStartDate(value)
    setEndDate('')
    setShowContent(false)
    const form = startDateInputRef.current?.form
    if (form) submit(form)
  }

  return (
    <div ref={ref}>
      <input
        type="hidden"
        name="startDate"
        form={form}
        ref={startDateInputRef}
        defaultValue={defaultStartDate}
      />
      <input
        type="hidden"
        name="endDate"
        form={form}
        ref={endDateInputRef}
        defaultValue={defaultEndDate}
      />
      <DateSelectorButton
        startDate={defaultStartDate}
        endDate={defaultEndDate}
        onClick={() => {
          setShowContent((shown) => !shown)
        }}
        expanded={showContent}
      />
      <DetailsDropdownContent
        className={classNames('maxw-card-xlg', {
          'display-none': !showContent,
        })}
      >
        <CardBody>
          <Grid row>
            <Grid col={4} key="radio-alltime">
              <Radio
                form=""
                id="radio-alltime"
                name="radio-date"
                value=""
                label="All Time"
                defaultChecked={!defaultStartDate && !defaultEndDate}
                onChange={radioOnChange}
              />
            </Grid>
            {Object.entries(dateSelectorLabels).map(([value, label]) => (
              <Grid col={4} key={`radio-${value}`}>
                <Radio
                  form=""
                  id={`radio-${value}`}
                  name="radio-date"
                  value={value}
                  label={label}
                  defaultChecked={value === defaultStartDate}
                  onChange={radioOnChange}
                />
              </Grid>
            ))}
            <Grid col={4}>
              <Radio
                form=""
                id="radio-custom"
                name="radio-date"
                value="custom"
                label="Custom Range..."
                defaultChecked={defaultShowDateRange}
                onChange={({ target: { checked } }) => {
                  setShowDateRange(checked)
                }}
              />
            </Grid>
          </Grid>
          {showDateRange && (
            <DateRangePicker
              startDateHint="YYYY-MM-DD"
              startDateLabel="Start Date"
              className="margin-bottom-2"
              startDatePickerProps={{
                form: '',
                id: 'event-date-start',
                name: 'event-date-start',
                dateFormat: 'YYYY-MM-DD',
                defaultValue: defaultStartDate,
                onChange: (value) => {
                  setStartDate(value ?? '')
                },
              }}
              endDateHint="YYYY-MM-DD"
              endDateLabel="End Date"
              endDatePickerProps={{
                form: '',
                id: 'event-date-end',
                name: 'event-date-end',
                dateFormat: 'YYYY-MM-DD',
                defaultValue: defaultEndDate,
                onChange: (value) => {
                  setEndDate(value ?? '')
                },
              }}
            />
          )}
        </CardBody>
        {showDateRange && (
          <CardFooter>
            <Button
              type="button"
              onClick={() => {
                setShowContent(false)
                const form = startDateInputRef.current?.form
                if (form) submit(form)
              }}
            >
              Submit
            </Button>
          </CardFooter>
        )}
      </DetailsDropdownContent>
    </div>
  )
}
