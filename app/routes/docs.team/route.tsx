/*!
 * Copyright © 2025 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from '@remix-run/react'
import {
  CardBody,
  CardGroup,
  CardHeader,
  CardMedia,
  GridContainer,
} from '@trussworks/react-uswds'
import type { ReactNode } from 'react'

import type { BreadcrumbHandle } from '~/root/Title'

import headshot from './headshot.png'

export const handle: BreadcrumbHandle = { breadcrumb: 'Team' }

function TeamCard({
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
    <>
      <div className="usa-card__container margin-bottom-2 grid-col-4">
        <CardMedia imageClass="bg-white margin-0">
          <img src={photo} loading="lazy" alt="placeholder" />
        </CardMedia>
        <CardHeader>
          <h4 style={{ marginBottom: '0px' }}>{name}</h4>
          <p style={{ marginTop: '0px', fontSize: '12px' }}>{affiliation}</p>
        </CardHeader>
        <CardBody style={{ fontSize: '16px' }}>{children}</CardBody>
      </div>
    </>
  )
}

export default function () {
  return (
    <GridContainer className="usa-section">
      <h1>GCN Team</h1>
      <p className="usa-paragraph">
        The current and past contributors to GCN. For questions, please contact
        us via the{' '}
        <Link className="usa-link" to="/contact">
          GCN Helpdesk
        </Link>{' '}
        .
      </p>
      <CardGroup>
        <TeamCard name="Judy Racusin" affiliation="NASA/GSFC" photo={headshot}>
          Principal Investigator
        </TeamCard>
        <TeamCard name="Leo Singer" affiliation="NASA/GSFC" photo={headshot}>
          Lead Developer
        </TeamCard>
        <TeamCard
          name="Dakota Dutko"
          affiliation="NASA/GSFC/ADNET"
          photo={headshot}
        >
          Full-Stack Developer
        </TeamCard>
        <TeamCard
          name="Courey Elliott"
          affiliation="Lousiana State University/ NextSource"
          photo={headshot}
        >
          Full-Stack Developer
        </TeamCard>
        <TeamCard
          name="Vidushi Sharma"
          affiliation="NASA/GSFC/UMBC"
          photo={headshot}
        >
          Postdoc
        </TeamCard>
        <TeamCard
          name="Tyler Barna"
          affiliation="University of Minnesota"
          photo={headshot}
        >
          Ph.D. Student
        </TeamCard>
      </CardGroup>
    </GridContainer>
  )
}
