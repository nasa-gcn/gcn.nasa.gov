/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { findAndReplace } from 'hast-util-find-and-replace'
import { h } from 'hastscript'

const suffixChars = /[a-zA-Z0-9/_=+]/.source
const suffixCharsNonTerminal = /[-.~%:?]/.source
const prefix = /https?:\/\//.source
const terminal = /\s|$/.source
const regexp = new RegExp(
  `${prefix}(?:${suffixChars}|(?:${suffixCharsNonTerminal})(?!${terminal}))+`,
  'g'
)

function autolinkLiteral(tree: Parameters<typeof findAndReplace>[0]) {
  findAndReplace(
    tree,
    [
      regexp,
      (href: string) =>
        h('a', { rel: 'external noopener', href, target: '_blank' }, href),
    ],
    { ignore: ['data'] }
  )
  return tree
}

/**
 * Remark plugin to transform strings that look like URLs to hyperlinks.
 * This approximates the "autolink literal" functionality of
 * https://github.com/remarkjs/remark-gfm.
 */
export default function rehypeAutolinkLiteral() {
  return autolinkLiteral
}
