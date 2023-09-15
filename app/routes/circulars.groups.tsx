import type { DataFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { useState } from 'react'

import { getCircularsGroupedByEvent } from './circulars/circulars.server'

export async function loader({ request: { url } }: DataFunctionArgs) {
  const page = 0
  const limit = 100
  const { items } = await getCircularsGroupedByEvent({ page, limit })
  return { items }
}

export default function () {
  const { items } = useLoaderData<typeof loader>()
  const [showCircularGroup, setShowCircularGroup] = useState('')
  const [hide, setHide] = useState(false)

  return (
    <>
      <h1>Related Events</h1>
      <div className="usa-accordion usa-accordion--bordered">
        <ul className="">
          {items.map(({ id, circulars }) => (
            <li key={id} className="usa-list--unstyled">
              <h4 className="usa-accordion__heading">
                <button
                  type="button"
                  className="usa-accordion__button margin-top-1"
                  aria-expanded={showCircularGroup === id}
                  aria-controls={id}
                  onClick={() => {
                    const circularGroupId = id === showCircularGroup ? '' : id
                    setShowCircularGroup(circularGroupId)
                    setHide(id === showCircularGroup)
                  }}
                >
                  {id || 'misc'}
                </button>
              </h4>
              <div className={id}>
                <ul
                  className="usa-accordion border-base-lighter border-05"
                  hidden={showCircularGroup != id || hide}
                >
                  {circulars.map(({ circularId, subject }) => (
                    <li
                      key={circularId}
                      className="usa-list--unstyled margin-05"
                    >
                      <Link to={`/circulars/${circularId}`}>{subject}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
