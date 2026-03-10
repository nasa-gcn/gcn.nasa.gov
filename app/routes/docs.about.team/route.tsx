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
  github?: string
}) {
  return (
    <Card gridLayout={{ tablet: { col: 4 } }}>
      <CardMedia>
        <img src={photo} width="50" height="50" alt={`Photograph of ${name}`} />
      </CardMedia>
      <CardHeader>
        <h3 className="margin-bottom-0">{name}</h3>
        <small>{affiliation}</small>
      </CardHeader>
      <CardBody>
        {children}
        {github && (
          <>
            <br />
            <Link
              className="usa-link"
              to={`https://github.com/${github}`}
              title={`Link to ${name}'s GitHub profile`}
            >
              <Icon.Github role="presentation" className="margin-y-neg-2px" />{' '}
              {github}
            </Link>
          </>
        )}
      </CardBody>
    </Card>
  )
}

export default function () {
  return (
    <>
      <h1>GCN Team</h1>
      <p className="usa-paragraph">
        These are the current and past contributors to GCN. For questions,
        please{' '}
        <Link className="usa-link" to="/contact">
          contact our help desk
        </Link>
        .
      </p>
      <h2>Current Team Members</h2>

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
          affiliation="University of Minnesota"
          photo={tyler}
          github="tylerbarna"
        >
          Ph.D. Student
        </TeamCard>

        <TeamCard
          name="Eric Burns"
          affiliation="Louisiana State University"
          photo={eric}
          github="eburnsastro"
        >
          Collaborator
        </TeamCard>

        <TeamCard
          name="Michael Coughlin"
          affiliation="University of Minnesota"
          photo={michael}
          github="mcoughlin"
        >
          Collaborator
        </TeamCard>
      </CardGroup>

      <h2>Past Team Members</h2>

      <CardGroup>
        <TeamCard
          name="Scott Barthelmy"
          affiliation="NASA/GSFC (retired)"
          photo={scott}
        >
          Founder
        </TeamCard>

        <TeamCard
          name="Teresa Sheets"
          affiliation="NASA/GSFC (retired)"
          photo={headshot}
        >
          Scientific Programmer
        </TeamCard>
      </CardGroup>
    </>
  )
}
