/*!
 * Copyright © 2025 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from '@remix-run/react'
import {
  Card,
  CardBody,
  CardGroup,
  CardHeader,
  CardMedia,
  Grid,
  GridContainer,
} from '@trussworks/react-uswds'
import type { ReactNode } from 'react'

import team2 from '../news._index/AAS243_booth.jpg'
import courey from './courey_photo.jpeg'
import dakota from './dakota_photo.jpg'
import eric from './eric_photo.jpg'
import team1 from './gcn_team_photo-1.jpg'
import team3 from './gcn_team_photo-3.jpg'
import team4 from './gcn_team_photo-4.jpg'
import leo from './leo_photo.jpeg'
import michael from './michael_photo.jpeg'
import scott from './scott_photo.jpg'
import tyler from './tyler_photo.jpg'
import type { BreadcrumbHandle } from '~/root/Title'

import headshot from './headshot.png'
import judy from './judy_photo.png'
import vidushi from './vidushi_photo.png'

export const handle: BreadcrumbHandle = { breadcrumb: 'Team' }

function TeamCard({
  children,
  name,
  affiliation,
  photo,
  href,
}: {
  children: ReactNode
  name: string
  affiliation: string
  photo: string
  href: string
}) {
  return (
    <Card className="grid-col-fill">
      <CardMedia imageClass="bg-white">
        <img
          src={photo}
          width="50"
          height="50"
          alt="Photograph of GCN team member"
        />
      </CardMedia>
      <CardHeader>
        <h4 style={{ marginBottom: '0px' }}>
          <a className="usa-link" href={href}>
            <>{name}</>
          </a>
        </h4>
        <p style={{ marginTop: '0px', fontSize: '12px' }}>{affiliation}</p>
      </CardHeader>
      <CardBody style={{ fontSize: '16px' }}>{children}</CardBody>
    </Card>
  )
}

function TeamPicture({ src, altText }: { src: string; altText: string }) {
  return (
    <GridContainer>
      <Grid
        row
        className="maxh-mobile-lg maxw-tablet overflow-hidden margin-bottom-4"
      >
        <img src={src} alt={altText} />
      </Grid>
    </GridContainer>
  )
}

export default function () {
  return (
    <>
      <h1>GCN Team</h1>
      <p className="usa-paragraph">
        The current and past contributors to GCN. For questions, please contact
        us via the{' '}
        <Link className="usa-link" to="/contact">
          GCN Helpdesk
        </Link>{' '}
        .
      </p>
      <h2>Current Team</h2>

      <GridContainer>
        <Grid row>
          <CardGroup>
            <TeamCard
              name="Judy Racusin"
              affiliation="NASA/GSFC"
              photo={judy}
              href="https://github.com/jracusin"
            >
              Principal Investigator
            </TeamCard>

            <TeamCard
              name="Leo Singer"
              affiliation="NASA/GSFC"
              photo={leo}
              href="https://github.com/lpsinger"
            >
              Lead Developer
            </TeamCard>
            <TeamCard
              name="Dakota Dutko"
              affiliation="NASA/GSFC/ADNET"
              photo={dakota}
              href="https://github.com/dakota002"
            >
              Full-Stack Developer
            </TeamCard>
          </CardGroup>
        </Grid>

        <TeamPicture src={team1} altText="GCN Team at GSFC" />

        <Grid row>
          <CardGroup>
            <TeamCard
              name="Courey Elliott"
              affiliation="LSU/NextSource"
              photo={courey}
              href="https://github.com/courey"
            >
              Full-Stack Developer
            </TeamCard>
            <TeamCard
              name="Vidushi Sharma"
              affiliation="NASA/GSFC/UMBC"
              photo={vidushi}
              href="https://github.com/vidushi-github"
            >
              Postdoc
            </TeamCard>

            <TeamCard
              name="Tyler Barna"
              affiliation="UMN"
              photo={tyler}
              href="https://github.com/tylerbarna"
            >
              Ph.D. Student
            </TeamCard>
          </CardGroup>
        </Grid>

        <TeamPicture src={team2} altText="GCN Team at AAS 243" />

        <Grid row className="grid-col-8">
          <CardGroup>
            <TeamCard
              name="Eric Burns"
              affiliation="LSU"
              photo={eric}
              href="https://github.com/eburnsastro"
            >
              Collaborator
            </TeamCard>

            <TeamCard
              name="Michael Coughlin"
              affiliation="UMN"
              photo={michael}
              href="https://github.com/mcoughlin"
            >
              Collaborator
            </TeamCard>
          </CardGroup>
        </Grid>

        <TeamPicture src={team3} altText="GCN Team at GCN Meeting 2024" />

        <h2>Past Team</h2>

        <Grid row className="grid-col-8">
          <CardGroup>
            <TeamCard
              name="Scott Barthelmy"
              affiliation="NASA/GSFC (retired)"
              photo={scott}
              href=""
            >
              GCN Classic Founder
            </TeamCard>

            <TeamCard
              name="Teresa Sheets"
              affiliation="NASA/GSFC (retired)"
              photo={headshot}
              href=""
            >
              GCN Classic Developer
            </TeamCard>
          </CardGroup>
        </Grid>
        <TeamPicture src={team4} altText="GCN Team at AAS 245" />
      </GridContainer>
    </>
  )
}
