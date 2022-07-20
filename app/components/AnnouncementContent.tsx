/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { Link } from '@trussworks/react-uswds'

export default function AnnouncementContent() {
  return (
    <section>
      <strong>
        We invite you to join one of our three public Zoom webinars for an
        overview of the new GCN.
      </strong>
      <div className="grid-row">
        <div className="grid-col-4">
          August 1, 2022 12:00-13:00 UTC <br /> (best for Atlantic):
          <br />
          <Link rel="external" href="https://bit.ly/3Pt2TH9">https://bit.ly/3Pt2TH9</Link>
        </div>
        <div className="grid-col-4">
          August 1, 2022 20:00-21:00 UTC <br /> (best for Pacific):
          <br />
          <Link rel="external" href="https://bit.ly/3IT7Qqc">https://bit.ly/3IT7Qqc</Link>
        </div>
        <div className="grid-col-4">
          August 2, 2022 04:00-05:00 UTC <br /> (best for Asia and Oceania):
          <br />
          <Link href={'https://bit.ly/3v2pNwV'}>https://bit.ly/3v2pNwV</Link>
        </div>
      </div>
    </section>
  )
}
