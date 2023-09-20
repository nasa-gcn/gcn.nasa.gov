/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { rehypeAstro } from '@nasa-gcn/remark-rehype-astro'
import { Link } from '@remix-run/react'
import type { Root } from 'mdast'
import { Fragment, createElement } from 'react'
import rehypeReact from 'rehype-react'
import remarkRehype from 'remark-rehype'
import { type Plugin, unified } from 'unified'
import { u } from 'unist-builder'

import rehypeAutolinkLiteral from './rehypeAutolinkLiteral'

import styles from './PlainTextBody.module.css'

/** A Unified.js parser plugin that just returns a canned tree. */
const remarkFromMdast: Plugin<[Root], string, Root> = function (tree) {
  this.Parser = () => tree
}

function LinkWrapper({
  children,
  ...props
}: Omit<JSX.IntrinsicElements['a'], 'ref'>) {
  if (props.href) {
    return (
      <Link to={props.href} {...props}>
        {children}
      </Link>
    )
  } else {
    return <a {...props}>{children}</a>
  }
}

function AstroData({
  children,
  value,
  className,
}: JSX.IntrinsicElements['data']) {
  if (className === 'gcn-circular') {
    return <Link to={`/circulars/${value}`}>{children}</Link>
  } else if (className === 'arXiv') {
    return (
      <a rel="external" href={`https://arxiv.org/abs/${value}`}>
        {children}
      </a>
    )
  } else if (className === 'doi') {
    return (
      <a rel="external" href={`https://doi.org/${value}`}>
        {children}
      </a>
    )
  } else {
    return <>{children}</>
  }
}

export function PlainTextBody({ children }: { children: string }) {
  const tree = u('root', [u('code', children)])

  const { result } = unified()
    .use(remarkFromMdast, tree)
    .use(remarkRehype)
    .use(rehypeAstro)
    .use(rehypeAutolinkLiteral)
    .use(rehypeReact, {
      Fragment,
      createElement,
      components: { a: LinkWrapper, data: AstroData },
    })
    .processSync()

  return <div className={styles.PlainTextBody}>{result}</div>
}
