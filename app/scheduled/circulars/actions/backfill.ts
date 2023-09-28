/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { CircularAction } from '../actions'
import { parseEventFromSubject } from '~/routes/circulars/circulars.lib'
import { updateEventData } from '~/routes/circulars/circulars.server'

export const statsAction: CircularAction<Record<string, number>> = {
  initialize() {
    return {}
  },
  action(circulars) {
    for (const circular of circulars) {
      if (circular.eventId) {
        return
      }
      const eventId = parseEventFromSubject(circular.subject)
      const synonyms = eventId ? [eventId] : []
      if (!eventId && !synonyms) {
        return
      }
      updateEventData({
        circularId: circular.circularId,
        eventId,
        synonyms,
      })
    }
  },
  async finalize() {
    return
  },
}
