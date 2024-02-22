/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { type KeyboardEvent } from 'react'

import { insertText, linesep } from '.'

function identity([fullMatch]: RegExpMatchArray) {
  return fullMatch
}

const matchers: {
  regexp: RegExp
  next: (match: RegExpMatchArray) => string
}[] = [
  { regexp: /^\s*[-*>]?\s+/, next: identity },
  {
    regexp: /^(\s*)(\d+)(\.\s+)/,
    next: ([, prefix, num, suffix]) => `${prefix}${parseInt(num) + 1}${suffix}`,
  },
]

/**
 * Automatically continue unordered lists (-, *), ordered lists (1., 2., ...),
 * indented whitespace, and quotations (>) on pressing Enter.
 */
export function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
  if (e.key === 'Enter') {
    const { value, selectionStart } = e.currentTarget
    let startOfLine = value.lastIndexOf(
      linesep,
      selectionStart - linesep.length
    )
    if (startOfLine < 0) {
      startOfLine = 0
    } else {
      startOfLine += linesep.length
      if (startOfLine > selectionStart) {
        startOfLine = selectionStart
      }
    }
    const line = value.substring(startOfLine, selectionStart)
    for (const { regexp, next } of matchers) {
      const match = line.match(regexp)
      if (match) {
        insertText(`${linesep}${next(match)}`)
        e.preventDefault()
        break
      }
    }
  }
}
