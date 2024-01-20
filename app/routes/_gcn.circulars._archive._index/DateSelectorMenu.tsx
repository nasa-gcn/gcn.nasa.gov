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
  CardFooter,
  DateRangePicker,
  Grid,
  Icon,
  Radio,
} from '@trussworks/react-uswds'
import { useState } from 'react'

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
  const slimClasses = 'height-4 padding-y-0'

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
  defaultStartDate,
  defaultEndDate,
}: {
  defaultStartDate?: string
  defaultEndDate?: string
}) {
  const [searchParams] = useSearchParams()

  const [startDate, setStartDate] = useState(defaultStartDate)
  const [endDate, setEndDate] = useState(defaultEndDate)
  const [showContent, setShowContent] = useState(false)
  const [showDateRange, setShowDateRange] = useState(false)

  const submit = useSubmit()

  function setFuzzyTime(startDate?: string) {
    setShowDateRange(false)
    setStartDate(startDate)
    setEndDate('')
  }

  function setDateRange() {
    setShowContent(false)
    if (startDate) searchParams.set('startDate', startDate)
    else searchParams.delete('startDate')
    if (endDate) searchParams.set('endDate', endDate)
    else searchParams.delete('endDate')
    submit(searchParams, {
      method: 'get',
      action: '/circulars',
    })
  }

  return (
    <>
      <DateSelectorButton
        startDate={defaultStartDate}
        endDate={defaultEndDate}
        onClick={() => {
          setShowContent((shown) => !shown)
          setShowDateRange(false)
        }}
        expanded={showContent}
      />
      {showContent && (
        <DetailsDropdownContent className="maxw-card-xlg">
          <CardBody>
            <Grid row>
              <Grid col={4} key="radio-alltime">
                <Radio
                  id="radio-alltime"
                  name="radio-date"
                  value=""
                  label="All Time"
                  defaultChecked={true}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                  }}
                />
              </Grid>
              {Object.entries(dateSelectorLabels).map(([value, label]) => (
                <Grid col={4} key={`radio-${value}`}>
                  <Radio
                    id={`radio-${value}`}
                    name="radio-date"
                    value={value}
                    label={label}
                    checked={value === startDate}
                    onChange={() => {
                      setFuzzyTime(value)
                    }}
                  />
                </Grid>
              ))}
              <Grid col={4}>
                <Radio
                  id="radio-custom"
                  name="radio-date"
                  value="custom"
                  label="Custom Range..."
                  checked={showDateRange}
                  onChange={(e) => {
                    setShowDateRange(e.target.checked)
                  }}
                />
              </Grid>
            </Grid>
            {showDateRange && (
              <DateRangePicker
                startDateHint="dd/mm/yyyy"
                startDateLabel="Start Date"
                className="margin-bottom-2"
                startDatePickerProps={{
                  id: 'event-date-start',
                  name: 'event-date-start',
                  defaultValue: 'startDate',
                  onChange: (value) => {
                    setStartDate(value)
                  },
                }}
                endDateHint="dd/mm/yyyy"
                endDateLabel="End Date"
                endDatePickerProps={{
                  id: 'event-date-end',
                  name: 'event-date-end',
                  defaultValue: 'endDate',
                  onChange: (value) => {
                    setEndDate(value)
                  },
                }}
              />
            )}

            <CardFooter>
              <Button
                type="button"
                form="searchForm"
                onClick={() => {
                  setDateRange()
                }}
              >
                <Icon.CalendarToday /> Submit
              </Button>
            </CardFooter>
          </CardBody>
        </DetailsDropdownContent>
      )}
    </>
  )
}
