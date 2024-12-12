/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { useHostname } from '~/root'

export function useCircularsEmailAddress() {
  let hostname = useHostname()
  if (!hostname?.endsWith('gcn.nasa.gov')) hostname = 'test.gcn.nasa.gov'
  return `circulars@${hostname}`
}

export function CircularsEmailAddress() {
  const address = useCircularsEmailAddress()
  return <a href={`mailto:${address}`}>{address}</a>
}
