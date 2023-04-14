/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { useHostname } from '~/root'

export function useCircularsEmailAddress() {
  let hostname = useHostname()
  if (!hostname.endsWith('gcn.nasa.gov')) hostname = 'test.gcn.nasa.gov'
  return `circulars@${hostname}`
}

export function CircularsEmailAddress() {
  const address = useCircularsEmailAddress()
  return <a href={`mailto:${address}`}>{address}</a>
}
