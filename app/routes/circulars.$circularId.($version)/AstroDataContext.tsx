/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Await, Link, type LinkProps } from '@remix-run/react'
import { Tooltip } from '@trussworks/react-uswds'
import classNames from 'classnames'
import {
  type ReactNode,
  type Ref,
  Suspense,
  createContext,
  forwardRef,
  useContext,
} from 'react'

import styles from './AstroDataContext.module.css'

export type AstroDataContextProps = Pick<
  JSX.IntrinsicElements['a'],
  'rel' | 'target'
>

export const AstroDataContext = createContext<AstroDataContextProps>({})

/**
 * An Astro Flavored Markdown enriched link.
 */
export const AstroDataLink = forwardRef(
  (
    {
      children,
      className,
      rel: origRel,
      external,
      ...props
    }: Omit<LinkProps, 'target'> & { external?: boolean },
    ref: Ref<HTMLAnchorElement>
  ) => {
    const context = useContext(AstroDataContext)
    const target = external ? '_blank' : context.target
    const rel =
      [origRel, context.rel, external ? 'external noopener' : '']
        .filter(Boolean)
        .join(' ') || undefined

    return (
      <Link
        className={classNames('usa-link', className)}
        target={target}
        rel={rel}
        ref={ref}
        {...props}
      >
        {children}
      </Link>
    )
  }
)

/**
 * An Astro Flavored Markdown enriched link with a tooltip to show extra
 * details about the data.
 *
 * The tooltip displays the text, "Loading...", until the content has been
 * fetched. The tooltip has a fixed size because react-uswds cannot properly
 * position the tooltip if the size changes when the content fills in.
 */
export function AstroDataLinkWithTooltip<T>({
  fetchFunction,
  label,
  children,
  ext,
  ...props
}: Omit<Parameters<typeof AstroDataLink>[0], 'ref'> & {
  fetchFunction: () => T
  label: (resolved: Awaited<T>) => ReactNode
  ext?: boolean
}) {
  return (
    <Tooltip
      {...props}
      label={
        <div className={classNames('width-card-lg font-ui-sm', styles.detail)}>
          <Suspense
            fallback={
              <>
                <div>Loading...</div>
                <div>&nbsp;</div>
                <div>&nbsp;</div>
              </>
            }
          >
            <Await
              resolve={fetchFunction()}
              errorElement={
                <>
                  <div>Not found</div>
                  <div>&nbsp;</div>
                  <div>&nbsp;</div>
                </>
              }
            >
              {label}
            </Await>
          </Suspense>
        </div>
      }
      asCustom={AstroDataLink}
      external={Boolean(ext)}
    >
      {children}
    </Tooltip>
  )
}
