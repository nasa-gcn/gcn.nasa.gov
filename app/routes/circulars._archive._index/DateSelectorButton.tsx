/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Button, ButtonGroup, Icon } from '@trussworks/react-uswds'

const dateSelectorLabels: Record<string, string> = {
  hour: 'Last Hour',
  today: 'Today',
  day: 'Last Day',
  week: 'Last Week',
  month: 'Last Month',
  year: 'Last Year',
  ytd: 'Year to Date',
}

export default function ({
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
