/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link, type LinkProps } from '@remix-run/react'
import classNames from 'classnames'
import { createContext, useContext } from 'react'

export type AstroDataContextProps = Pick<
  JSX.IntrinsicElements['a'],
  'rel' | 'target'
>

export const AstroDataContext = createContext<AstroDataContextProps>({})

export function AstroDataLink({
  children,
  className,
  rel: origRel,
  ...props
}: Omit<LinkProps, 'target'>) {
  const context = useContext(AstroDataContext)
  const rel = [origRel, context.rel].filter(Boolean).join(' ') || undefined

  return (
    <Link
      className={classNames('usa-link', className)}
      target={context.target}
      rel={rel}
      {...props}
    >
      {children}
    </Link>
  )
}
