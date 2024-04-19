/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { type LoaderFunction } from '@remix-run/node'
import { type useLoaderData } from '@remix-run/react'

import { AstroDataLink, AstroDataLinkWithTooltip } from './AstroDataContext'
import { type loader as arxivTooltipLoader } from '~/routes/api.tooltip.arxiv.$'
import { type loader as circularTooltipLoader } from '~/routes/api.tooltip.circular.$'
import { type loader as doiTooltipLoader } from '~/routes/api.tooltip.doi.$'

async function fetchTooltipData<loader extends LoaderFunction>(
  className: string,
  value: JSX.IntrinsicElements['data']['value']
): Promise<ReturnType<typeof useLoaderData<loader>>> {
  const response = await fetch(`/api/tooltip/${className}/${value}`)
  if (!response.ok) throw new Error('failed to fetch tooltip')
  return await response.json()
}

export function GcnCircular({
  children,
  value,
}: JSX.IntrinsicElements['data']) {
  return (
    <AstroDataLinkWithTooltip
      to={`/circulars/${value}`}
      fetch={() =>
        fetchTooltipData<typeof circularTooltipLoader>('circular', value)
      }
      label={({ subject, submitter }) => (
        <>
          <div>GCN {value}</div>
          <div>{submitter}</div>
          <div>{subject}</div>
        </>
      )}
    >
      {children}
    </AstroDataLinkWithTooltip>
  )
}

export function Arxiv({ children, value }: JSX.IntrinsicElements['data']) {
  return (
    <AstroDataLinkWithTooltip
      to={`https://arxiv.org/abs/${value}`}
      fetch={() => fetchTooltipData<typeof arxivTooltipLoader>('arxiv', value)}
      label={({ title, year, authors }) => (
        <>
          <div>arXiv:{value}</div>
          <div>
            {authors}, {year}
          </div>
          <div>{title}</div>
        </>
      )}
    >
      {children}
    </AstroDataLinkWithTooltip>
  )
}

export function Doi({ children, value }: JSX.IntrinsicElements['data']) {
  return (
    <AstroDataLinkWithTooltip
      to={`https://doi.org/${value}`}
      fetch={() => fetchTooltipData<typeof doiTooltipLoader>('doi', value)}
      label={({ authors, pub, year, title }) => (
        <>
          <div>{pub}</div>
          <div>
            {authors}, {year}
          </div>
          <div>{title}</div>
        </>
      )}
    >
      {children}
    </AstroDataLinkWithTooltip>
  )
}

export function Tns({ children, value }: JSX.IntrinsicElements['data']) {
  return (
    <AstroDataLink to={`https://www.wis-tns.org/object/${value}`}>
      {children}
    </AstroDataLink>
  )
}
