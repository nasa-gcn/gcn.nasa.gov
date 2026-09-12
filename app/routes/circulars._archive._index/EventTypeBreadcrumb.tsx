/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from '@remix-run/react'
import {
  Breadcrumb,
  BreadcrumbBar,
  BreadcrumbLink,
  Button,
  CardBody,
  Icon,
} from '@trussworks/react-uswds'
import { useRef, useState } from 'react'
import { useOnClickOutside } from 'usehooks-ts'

import DetailsDropdownContent from '~/components/DetailsDropdownContent'
import {
  eventTypesHumanReadable,
  formatEventTypeSlug,
} from '~/routes/circulars/circulars.lib'

export function EventTypeBreadcrumb({ eventType }: { eventType?: string }) {
  const eventTypeHumanReadable = eventType
    ? eventTypesHumanReadable[eventType]?.plural
    : undefined
  const [showEventTypeDropdown, setShowEventTypeDropdown] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useOnClickOutside(ref, () => {
    setShowEventTypeDropdown(false)
  })

  if (!eventTypeHumanReadable) return null

  return (
    <BreadcrumbBar className="usa-breadcrumb--wrap desktop:margin-top-neg-6 margin-top-neg-4 padding-top-0 margin-bottom-neg-3">
      <Breadcrumb>
        <BreadcrumbLink href="/circulars">GCN Circulars</BreadcrumbLink>
      </Breadcrumb>
      <Breadcrumb current>
        <div ref={ref} className="display-inline">
          <Button
            type="button"
            unstyled
            onClick={() => {
              setShowEventTypeDropdown((isShown) => !isShown)
            }}
          >
            {eventTypeHumanReadable}
            <Icon.ExpandMore role="presentation" />
          </Button>
          {showEventTypeDropdown && (
            <DetailsDropdownContent className="padding-0">
              <CardBody
                className="padding-0"
                style={{ maxHeight: '15rem', overflowY: 'auto' }}
              >
                <ul className="usa-list usa-list--unstyled">
                  {Object.entries(eventTypesHumanReadable)
                    .sort(
                      (
                        [eventTypeA, { plural: pluralA }],
                        [eventTypeB, { plural: pluralB }]
                      ) => {
                        const eventTypesBreadcrumbOrder: Record<
                          string,
                          number
                        > = {
                          Misc: 1,
                          Retraction: 2,
                        }

                        return (
                          (eventTypesBreadcrumbOrder[eventTypeA] ?? 0) -
                            (eventTypesBreadcrumbOrder[eventTypeB] ?? 0) ||
                          pluralA.localeCompare(pluralB)
                        )
                      }
                    )
                    .map(([eventType, { plural }]) => (
                      <li key={eventType}>
                        <Link
                          to={`/circulars/types/${formatEventTypeSlug(eventType)}`}
                          className="usa-link"
                          onClick={() => setShowEventTypeDropdown(false)}
                        >
                          {plural}
                        </Link>
                      </li>
                    ))}
                </ul>
              </CardBody>
            </DetailsDropdownContent>
          )}
        </div>
      </Breadcrumb>
    </BreadcrumbBar>
  )
}
