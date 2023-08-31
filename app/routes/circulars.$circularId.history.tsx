import type { DataFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Icon, Radio } from '@trussworks/react-uswds'
import { useState } from 'react'
import { DiffMethod } from 'react-diff-viewer-continued'

import { getUser } from './_auth/user.server'
import type { Circular } from './circulars/circulars.lib'
import { get, getCircularHistory } from './circulars/circulars.server'
import TimeAgo from '~/components/TimeAgo'
import { feature, origin } from '~/lib/env.server'
import { getCanonicalUrlHeaders } from '~/lib/headers.server'

const DiffViewer = require('react-diff-viewer-continued').default

export async function loader({
  request,
  params: { circularId },
}: DataFunctionArgs) {
  if (!feature('CIRCULAR_VERSIONS')) throw new Response(null, { status: 404 })
  if (!circularId)
    throw new Response('circularId must be defined', { status: 400 })
  const user = await getUser(request)

  const isModUser = user?.groups.includes('gcn.nasa.gov/circular-moderator')
  const result = await get(parseFloat(circularId))
  const history = await getCircularHistory(parseFloat(circularId))
  return json(
    { result, isModUser, history },
    {
      headers: getCanonicalUrlHeaders(
        new URL(`/circulars/${circularId}/history`, origin)
      ),
    }
  )
}

export default function () {
  const { result, history } = useLoaderData<typeof loader>()
  const [oldCircular, setOldCircular] = useState<Circular | undefined>()

  return (
    <>
      <Link to={`/circulars/${result.circularId}`} className="usa-button">
        <div className="position-relative">
          <Icon.ArrowBack
            role="presentation"
            className="position-absolute top-0 left-0"
          />
        </div>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Back
      </Link>
      <h1>
        GCN Circular {result.circularId}
        {history.length > 0 && (
          <small>
            {' ('}Edited{')'}
          </small>
        )}
      </h1>
      <div>
        Select an earlier version of this circular to compare with the current
        version. Highlighted sections with a minus (-) are changes that have
        been replaced by the highlighted sections with plus (+).
      </div>
      {history.map((circular) => (
        <Radio
          key={circular.createdOn}
          id={circular.createdOn.toString()}
          name="baseVersion"
          label={
            <>
              Deprecated <TimeAgo time={circular.createdOn} /> by{' '}
              {circular.editedBy}
            </>
          }
          onClick={() => setOldCircular(circular)}
        />
      ))}

      {oldCircular && <Diff />}
    </>
  )
}

function Diff() {
  // Why doesnt this work anymore?
  return (
    <DiffViewer
      // oldValue={oldCircular.subject + '\n' + oldCircular.body}
      // newValue={result.subject + '\n' + result.body}
      oldValue={'test'}
      newValue={'value'}
      splitView={false}
      hideLineNumbers
      compareMethod={DiffMethod.WORDS}
    />
  )
}
