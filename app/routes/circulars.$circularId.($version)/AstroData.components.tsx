/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { type Circular } from '../circulars/circulars.lib'
import { AstroDataLink, AstroDataLinkWithTooltip } from './AstroDataContext'
import { useOrigin } from '~/root'

export function GcnCircular({
  children,
  value,
}: JSX.IntrinsicElements['data']) {
  const origin = useOrigin()

  return (
    <AstroDataLinkWithTooltip
      to={`/circulars/${value}`}
      fetch={async () => {
        const response = await fetch(`${origin}/circulars/${value}.json`)
        return (await response.json()) as Circular
      }}
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
      fetch={async () => {
        const response = await fetch(
          `https://export.arxiv.org/api/query?id_list=${value}`
        )
        const text = await response.text()
        const entry = new DOMParser()
          .parseFromString(text, 'text/xml')
          .getElementsByTagName('entry')[0]

        const title = entry.getElementsByTagName('title')[0].textContent

        const published = entry.getElementsByTagName('published')[0].textContent
        const year = published && new Date(published).getFullYear()

        const authorElements = entry.getElementsByTagName('author')
        let authors =
          authorElements[0].getElementsByTagName('name')[0].textContent
        if (authorElements.length > 1) authors += ' et al.'

        return { title, year, authors }
      }}
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
