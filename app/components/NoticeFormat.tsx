/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { Fieldset, Radio } from '@trussworks/react-uswds'

export function NoticeFormat({ name }: { name: string }) {
  return (
    <Fieldset legend="Notice Format">
      <Radio
        tile
        defaultChecked
        id="text"
        name={name}
        value="text"
        label="Text"
        labelDescription="Plain text key: value pairs separated by newlines."
      />
      <Radio
        tile
        id="voevent"
        name={name}
        value="voevent"
        label="VOEvent"
        labelDescription={
          <>
            <a
              rel="external"
              href="http://ivoa.net/Documents/latest/VOEvent.html"
            >
              VOEvent XML
            </a>
            .
          </>
        }
      />
      <Radio
        tile
        id="binary"
        name={name}
        value="binary"
        label="Binary"
        labelDescription={
          <>
            160-byte binary format. Field packing is{' '}
            <a
              rel="external"
              href="https://gcn.gsfc.nasa.gov/sock_pkt_def_doc.html"
            >
              specific to each notice type.
            </a>
          </>
        }
      />
    </Fieldset>
  )
}
