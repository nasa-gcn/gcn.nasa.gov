/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from '@remix-run/react'
import {
  Card,
  CardBody,
  CardFooter,
  CardGroup,
  CardHeader,
  CardMedia,
} from '@trussworks/react-uswds'

import gcn_classic_over_kafka from './gcn-classic-over-kafka.svg'
import gcn_classic from './gcn-classic.svg'
import gcn_kafka from './gcn-kafka.svg'

export function NoticeFormatsAd() {
  return (
    <CardGroup>
      <Card gridLayout={{ tablet: { col: 4 } }} headerFirst>
        <CardHeader className="bg-base-lighter">
          <p className="margin-0 text-base-dark">For legacy applications</p>
          <h4 className="usa-card__heading">GCN Classic</h4>
        </CardHeader>
        <CardMedia imageClass="bg-white padding-2">
          <img
            src={gcn_classic}
            width="347.84"
            height="282.47"
            loading="lazy"
            alt="Data flow diagram for GCN Classic"
          />
        </CardMedia>
        <CardBody>
          <p>Three formats, three protocols.</p>
        </CardBody>
        <CardFooter>
          <a
            className="usa-button usa-button--base"
            href="https://gcn.gsfc.nasa.gov/invitation.html"
          >
            <>Get Started (Old Web Site)</>
          </a>
        </CardFooter>
      </Card>
      <Card
        className="card-accent-cool"
        gridLayout={{ tablet: { col: 4 } }}
        headerFirst
      >
        <CardHeader>
          <p className="margin-0">Recommended for classic topics</p>
          <h4 className="usa-card__heading">GCN Classic over Kafka</h4>
        </CardHeader>
        <CardMedia imageClass="bg-white padding-2">
          <img
            src={gcn_classic_over_kafka}
            width="347.84"
            height="282.47"
            loading="lazy"
            className="height-auto"
            alt="Data flow diagram for GCN Classic over Kafka"
          />
        </CardMedia>
        <CardBody>
          <p>Three formats, one protocol.</p>
        </CardBody>
        <CardFooter>
          <Link className="usa-button" to="/quickstart">
            Get Started
          </Link>
        </CardFooter>
      </Card>
      <Card
        className="card-accent-cool"
        gridLayout={{ tablet: { col: 4 } }}
        headerFirst
      >
        <CardHeader>
          <p className="margin-0">Recommended for available topics</p>
          <h4 className="usa-card__heading">GCN Kafka</h4>
        </CardHeader>
        <CardMedia imageClass="bg-white padding-2">
          <img
            src={gcn_kafka}
            width="347.84"
            height="282.47"
            loading="lazy"
            alt="Data flow diagram for GCN Kafka"
          />
        </CardMedia>
        <CardBody>
          <p>One format, one protocol.</p>
        </CardBody>
        <CardFooter>
          <Link className="usa-button" to="/quickstart?noticeFormat=json">
            Get Started
          </Link>
        </CardFooter>
      </Card>
    </CardGroup>
  )
}
