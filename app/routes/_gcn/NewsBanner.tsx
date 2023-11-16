/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { GridContainer } from '@trussworks/react-uswds'

export default function NewsBanner({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-gold padding-x-2 desktop:padding-x-4 padding-y-1 line-height-sans-3 font-lang-4 text-bold">
      <GridContainer>{children}</GridContainer>
    </div>
  )
}
