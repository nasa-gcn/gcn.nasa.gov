/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { rehypeAstro } from '@nasa-gcn/remark-rehype-astro'
import classNames from 'classnames'
import type { Root } from 'mdast'
import { Fragment, createElement } from 'react'
import rehypeClassNames from 'rehype-class-names'
import rehypeReact from 'rehype-react'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { type Plugin, unified } from 'unified'
import { u } from 'unist-builder'

import { AstroData } from './AstroData'
import { AstroDataLink } from './AstroDataContext'
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
      <AstroDataLink to={props.href} {...props}>
        {children}
      </AstroDataLink>
    )
  } else {
    return <a {...props}>{children}</a>
  }
}

export function MarkdownBody({
  children,
  ...props
}: {
  children: string
} & Omit<JSX.IntrinsicElements['div'], 'children'>) {
  const { result } = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeAstro)
    .use(rehypeClassNames, {
      ol: 'usa-list',
      p: 'usa-paragraph',
      table: 'usa-table',
      ul: 'usa-list',
    })
    .use(rehypeReact, {
      Fragment,
      createElement,
      components: { a: LinkWrapper, data: AstroData },
    })
    .processSync(children)

  return <div {...props}>{result}</div>
}

export function PlainTextBody({
  className,
  children,
  ...props
}: {
  children: string
} & Omit<JSX.IntrinsicElements['div'], 'children'>) {
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

  return (
    <div {...props} className={classNames(styles.PlainTextBody, className)}>
      {result}
    </div>
  )
}
