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
  Icon,
} from '@trussworks/react-uswds'
import type { ReactNode } from 'react'

import courey from './courey_photo.jpg'
import dakota from './dakota_photo.jpg'
import eric from './eric_photo.jpg'
import leo from './leo_photo.jpg'
import michael from './michael_photo.jpg'
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
  github,
}: {
  children: ReactNode
  name: string
  affiliation: string
  photo: string
  github: string
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
        <Link className="usa-link" to={`https://github.com/${github}`}>
          {name}
          <Icon.Github role="presentation" size={3} color="black" />
        </Link>{' '}
        <p style={{ marginTop: '0px', fontSize: '12px' }}>{affiliation}</p>
      </CardHeader>
      <CardBody style={{ fontSize: '14px' }}>{children}</CardBody>
    </Card>
  )
}

function TeamCardNoLink({
  children,
  name,
  affiliation,
  photo,
}: {
  children: ReactNode
  name: string
  affiliation: string
  photo: string
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
          <>{name}</>
        </h4>
        <p style={{ marginTop: '0px', fontSize: '12px' }}>{affiliation}</p>
      </CardHeader>
      <CardBody style={{ fontSize: '14px' }}>{children}</CardBody>
    </Card>
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
              github="jracusin"
            >
              Principal Investigator
            </TeamCard>

            <TeamCard
              name="Leo Singer"
              affiliation="NASA/GSFC"
              photo={leo}
              github="lpsinger"
            >
              Lead Developer
            </TeamCard>
            <TeamCard
              name="Dakota Dutko"
              affiliation="NASA/GSFC/ADNET"
              photo={dakota}
              github="dakota002"
            >
              Full-Stack Developer
            </TeamCard>
          </CardGroup>
        </Grid>

        <Grid row>
          <CardGroup>
            <TeamCard
              name="Courey Elliott"
              affiliation="LSU/NextSource"
              photo={courey}
              github="courey"
            >
              Full-Stack Developer
            </TeamCard>
            <TeamCard
              name="Vidushi Sharma"
              affiliation="NASA/GSFC/UMBC"
              photo={vidushi}
              github="vidushi-github"
            >
              Postdoc
            </TeamCard>

            <TeamCard
              name="Tyler Barna"
              affiliation="UMN"
              photo={tyler}
              github="tylerbarna"
            >
              Ph.D. Student
            </TeamCard>
          </CardGroup>
        </Grid>

        <Grid row className="grid-col-8">
          <CardGroup>
            <TeamCard
              name="Eric Burns"
              affiliation="LSU"
              photo={eric}
              github="eburnsastro"
            >
              Collaborator
            </TeamCard>

            <TeamCard
              name="Michael Coughlin"
              affiliation="UMN"
              photo={michael}
              github="mcoughlin"
            >
              Collaborator
            </TeamCard>
          </CardGroup>
        </Grid>

        <h2>Past Team</h2>

        <Grid row className="grid-col-8">
          <CardGroup>
            <TeamCardNoLink
              name="Scott Barthelmy"
              affiliation="NASA/GSFC (retired)"
              photo={scott}
            >
              GCN Classic Founder
            </TeamCardNoLink>

            <TeamCardNoLink
              name="Teresa Sheets"
              affiliation="NASA/GSFC (retired)"
              photo={headshot}
            >
              GCN Classic Developer
            </TeamCardNoLink>
          </CardGroup>
        </Grid>
      </GridContainer>
    </>
  )
}
