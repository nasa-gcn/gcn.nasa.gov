/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { type LoaderFunction } from '@remix-run/node'
import { type useLoaderData } from '@remix-run/react'

import { AstroDataLinkWithTooltip } from './AstroDataContext'
import { useSearchString } from '~/lib/utils'
import { type loader as arxivTooltipLoader } from '~/routes/api.tooltip.arxiv.$'
import { type loader as circularTooltipLoader } from '~/routes/api.tooltip.circular.$'
import { type loader as doiTooltipLoader } from '~/routes/api.tooltip.doi.$'
import type { loader as tnsTooltipLoader } from '~/routes/api.tooltip.tns.$'

import styles from './AstroData.components.module.css'

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
  const searchString = useSearchString()
  return (
    <AstroDataLinkWithTooltip
      to={`/circulars/${value}${searchString}`}
      fetchFunction={() =>
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
      ext
      fetchFunction={() =>
        fetchTooltipData<typeof arxivTooltipLoader>('arxiv', value)
      }
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
      ext
      fetchFunction={() =>
        fetchTooltipData<typeof doiTooltipLoader>('doi', value)
      }
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
    <AstroDataLinkWithTooltip
      to={`https://www.wis-tns.org/object/${value}`}
      ext
      fetchFunction={() =>
        fetchTooltipData<typeof tnsTooltipLoader>('tns', value)
      }
      label={({ ra, dec, names }) => (
        <>
          <div>{names.join(', ')}</div>
          <div className={styles.ra}>
            <span className={styles.h}>{ra[0]}</span>
            <span className={styles.sep}>
              <sup>h</sup>
            </span>
            <span className={styles.m}>{ra[1]}</span>
            <span className={styles.sep}>
              <sup>m</sup>
            </span>
            <span className={styles.s}>{ra[2]}</span>
            <span className={styles.sep}>
              <sup>s</sup>
              <span className="position-relative">
                <span
                  className="position-absolute width-0"
                  style={{ left: '-0.5ex' }}
                >
                  .
                </span>
              </span>
            </span>
            <span className={styles.f}>{ra[3]}</span>
          </div>
          <div className={styles.dec}>
            <span className={styles.d}>{dec[0]}</span>
            <span className={styles.sep}>°</span>
            <span className={styles.m}>{dec[1]}</span>
            <span className={styles.sep}>′</span>
            <span className={styles.s}>{dec[2]}</span>
            <span className={styles.sep}>
              ″
              <span className="position-relative">
                <span
                  className="position-absolute width-0"
                  style={{ left: '-1ex' }}
                >
                  .
                </span>
              </span>
            </span>
            <span className={styles.f}>{dec[3]}</span>
          </div>
        </>
      )}
    >
      {children}
    </AstroDataLinkWithTooltip>
  )
}
