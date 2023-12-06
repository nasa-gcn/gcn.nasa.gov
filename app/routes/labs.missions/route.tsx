import {
  Grid,
  GridContainer,
  Identifier,
  IdentifierIdentity,
  IdentifierLogos,
  IdentifierMasthead,
} from '@trussworks/react-uswds'

import fleet2 from './AstrophysicsFleet2.jpg'
import fermiHeroImage from './Fermi_Earth_GWs.jpg'
import type { BreadcrumbHandle } from '~/root/Title'

import meatball from '~/components/meatball/logo.svg'

export const handle: BreadcrumbHandle = {
  breadcrumb: 'Missions',
}

export default function () {
  return (
    <>
      <img
        alt="Fermi satellite with a GRB in the background, both positioned over earth"
        src={fermiHeroImage}
      />
      <GridContainer>
        <Grid row className="border-bottom border-gray-50">
          <h1>Mutimessenger missions</h1>
        </Grid>
        <Grid row>
          <h3>Overview</h3>
          <p>
            The joint discovery of gravitational waves and electromagnetic
            radiation from the binary neutron star merger GW170817 was a
            watershed moment for astrophysics. NASA missions played a critical
            role in this discovery, from constraining the speed of gravity, to
            determining the site of heavy (r-process) element formation, to
            furthering our understanding of the formation and structure of
            relativistic jets. The recent detection of a neutrino correlated in
            space and time with a flare from gamma-ray blazar has also provided
            a tantalizing clue to the origin of high-energy cosmic neutrinos.
            These studies of astrophysical transients and time-domain and
            multimessenger phenomena are perhaps the most rapidly growing field
            of astrophysics, rich with opportunities for exciting discoveries.
            In the present/near-future, NASA is well-positioned to capitalize on
            the exciting scientific opportunities in time-domain and
            multimessenger astrophysics. As highlighted in the 2019 Astrophysics
            Senior Review of Operating Missions, the portfolio provides a suite
            of capabilities that is “greater than the sum of its parts”, and
            will contribute significantly to the major science questions in this
            field.
          </p>
        </Grid>
        <Grid row>
          <div>
            <img
              alt="a diagram depicting all the missions in the fleet over time shaped as a swirl"
              src={fleet2}
            />
            <figcaption className="text-italic">
              The current NASA Astrophysics Fleet, flying and in development.
            </figcaption>
          </div>
        </Grid>
        <Grid>
          <div className="border-left-05 border-indigo">
            <p className="padding-left-1">
              "The complementary nature of these missions makes the overall
              capability of the portfolio more than the sum of its parts, and
              many of the most exciting developments in contemporary
              astrophysics draw on observations from several of these
              observatories simultaneously."
            </p>
            <Identifier>
              <IdentifierMasthead aria-label="Agency identifier">
                <IdentifierLogos>
                  <img
                    alt="nasa meatball logo"
                    width="50"
                    height="50"
                    src={meatball}
                  />
                </IdentifierLogos>
                <IdentifierIdentity domain="Executive Summary, Page 2">
                  2019 Astrophysics Senior Review
                </IdentifierIdentity>
              </IdentifierMasthead>
            </Identifier>
          </div>
        </Grid>
      </GridContainer>
    </>
  )
}
