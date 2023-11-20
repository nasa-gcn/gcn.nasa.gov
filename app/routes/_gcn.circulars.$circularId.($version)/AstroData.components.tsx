/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { AstroDataLink } from './AstroDataContext'

export function GcnCircular({
  children,
  value,
}: JSX.IntrinsicElements['data']) {
  return <AstroDataLink to={`/circulars/${value}`}>{children}</AstroDataLink>
}

export function Arxiv({ children, value }: JSX.IntrinsicElements['data']) {
  return (
    <AstroDataLink to={`https://arxiv.org/abs/${value}`}>
      {children}
    </AstroDataLink>
  )
}

export function Doi({ children, value }: JSX.IntrinsicElements['data']) {
  return (
    <AstroDataLink to={`https://doi.org/${value}`}>{children}</AstroDataLink>
  )
}

export function Tns({ children, value }: JSX.IntrinsicElements['data']) {
  return (
    <AstroDataLink to={`https://www.wis-tns.org/object/${value}`}>
      {children}
    </AstroDataLink>
  )
}
