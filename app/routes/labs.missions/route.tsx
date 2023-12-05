import { Grid, GridContainer } from '@trussworks/react-uswds'

import fleet2 from './AstrophysicsFleet2.jpg'
import fermiHeroImage from './Fermi_Earth_GWs.jpg'

import meatball from '~/components/meatball/logo.svg'

export default function () {
  return (
    <>
      <img
        alt="Fermi satellite with a GRB in the background, both positioned over earth"
        src={fermiHeroImage}
      />
      <GridContainer>
        <Grid
          row
          className="margin-bottom-2 margin-top-5 border-bottom border-gray-50"
        >
          <h1>Mutimessenger missions</h1>
        </Grid>
        <Grid row>
          <h3>Overview</h3>
          <p className="line-height-mono-4">
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
          <div className="text-center margin-bottom-2">
            <img
              alt="a diagram depicting all the missions in the fleet over time shaped as a swirl"
              src={fleet2}
            ></img>
            <figcaption className="text-thin text-italic">
              The current NASA Astrophysics Fleet, flying and in development.
            </figcaption>
          </div>
        </Grid>
        <div className="border-left-05 border-indigo">
          <p className="measure-6 padding-left-1">
            "The complementary nature of these missions makes the overall
            capability of the portfolio more than the sum of its parts, and many
            of the most exciting developments in contemporary astrophysics draw
            on observations from several of these observatories simultaneously."
          </p>
        </div>
        <section className="usa-identifier__section usa-identifier__section--masthead">
          <div className="usa-identifier__container">
            <div className="usa-identifier__logos">
              <div className="usa-identifier__logo">
                <img
                  alt="nasa meatball logo"
                  width="50"
                  height="50"
                  className="usa-identifier__logo-img"
                  src={meatball}
                ></img>
              </div>
            </div>
            <section
              className="usa-identifier__identity"
              aria-label="quote source identifier"
            >
              <p className="usa-identifier__identity-disclaimer">
                2019 Astrophysics Senior Review
              </p>
              <p className="usa-identifier__identity-domain">
                Executive Summary, Page 2
              </p>
            </section>
          </div>
        </section>
      </GridContainer>
    </>
  )
}
