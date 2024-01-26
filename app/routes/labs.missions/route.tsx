/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { GridContainer } from '@trussworks/react-uswds'

import fermiHeroImage from './Fermi_Earth_GWs.jpg'
import { Meatball } from '~/components/meatball/Meatball'
import type { BreadcrumbHandle } from '~/root/Title'

import fleet from './AstroFleetChart.png'
import missionTimeline from './mission-timeline.png'

export const handle: BreadcrumbHandle = {
  breadcrumb: 'Missions',
}

export default function () {
  return (
    <>
      <img
        alt="Fermi satellite with a GRB in the background, both positioned over earth"
        src={fermiHeroImage}
        height="1184"
        width="3546"
        className="width-full height-auto"
      />
      <GridContainer className="usa-section">
        <h1>Mutimessenger missions</h1>
        <h3>Overview</h3>
        <p className="usa-paragraph">
          The joint discovery of gravitational waves and electromagnetic
          radiation from the binary neutron star merger GW170817 was a watershed
          moment for astrophysics. NASA missions played a critical role in this
          discovery, from constraining the speed of gravity, to determining the
          site of heavy (r-process) element formation, to furthering our
          understanding of the formation and structure of relativistic jets. The
          recent detection of a neutrino correlated in space and time with a
          flare from gamma-ray blazar has also provided a tantalizing clue to
          the origin of high-energy cosmic neutrinos. These studies of
          astrophysical transients and time-domain and multimessenger phenomena
          are perhaps the most rapidly growing field of astrophysics, rich with
          opportunities for exciting discoveries. In the present/near-future,
          NASA is well-positioned to capitalize on the exciting scientific
          opportunities in time-domain and multimessenger astrophysics. As
          highlighted in the 2019 Astrophysics Senior Review of Operating
          Missions, the portfolio provides a suite of capabilities that is
          “greater than the sum of its parts”, and will contribute significantly
          to the major science questions in this field.
        </p>
        <figure>
          <img
            alt="a diagram depicting all the missions in the fleet over time shaped as a swirl"
            src={fleet}
            height="2160"
            width="3840"
            className="mobile:width-mobile width-tablet height-auto"
          />
          <figcaption>
            The current NASA Astrophysics fleet, flying and in development.
          </figcaption>
        </figure>

        <figure className="bordered">
          <blockquote>
            "The complementary nature of these missions makes the overall
            capability of the portfolio more than the sum of its parts, and many
            of the most exciting developments in contemporary astrophysics draw
            on observations from several of these observatories simultaneously."
          </blockquote>
          <figcaption>
            <Meatball className="height-auto width-5" />
            2019 Astrophysics Senior Review, Executive Summary, Page 2
          </figcaption>
        </figure>
        <div className="clearfix" />
        <h3>Multimessenger Mission Timeline</h3>
        <p className="usa-paragraph">
          NASA missions played a critical role in the discovery and
          characterization of the first binary neutron star merger (GW170817).
          In the near future, the balanced mission portfolio is well-positioned
          to continue to make major contributions to EM followup of
          gravitational-wave sources. Current workhorse facilities in the area
          of time-domain and multi-messenger astronomy such as Fermi, Swift,
          Chandra, & HST are well past design lifetimes. These capabilities are
          currently being augmented and will eventually be replaced by
          specialized CubeSats, SmallSats, and Missions of Opportunity, many of
          which are currently in development and lager missions currently being
          proposed.
        </p>
        <figure>
          <img
            alt="Gantt chart depicting various mission timelines from the year 2000 to 2032"
            src={missionTimeline}
            height="1618"
            width="1988"
            className="mobile:width-mobile width-tablet height-auto"
          />
        </figure>
      </GridContainer>
    </>
  )
}
