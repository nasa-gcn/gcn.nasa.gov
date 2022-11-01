/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { GridContainer } from '@trussworks/react-uswds'
import React from 'react'

interface SectionWrapperProps {
  children: React.ReactNode
  className?: string
}

export default function SectionWrapper(props: SectionWrapperProps) {
  return (
    <section
      className={
        props.className ? 'usa-section ' + props.className : 'usa-section'
      }
    >
      <GridContainer>{props.children}</GridContainer>
    </section>
  )
}
