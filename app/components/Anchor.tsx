/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { slug } from 'github-slugger'

/**
 * Wrap an element in a linkable anchor.
 *
 * This provides similar functionality to
 * https://github.com/rehypejs/rehype-slug and
 * https://github.com/rehypejs/rehype-autolink-headings
 * but on arbitrary text (not just headings).
 */
export function Anchor({ children }: { children: string }) {
  const id = slug(children)
  return (
    <a href={`#${id}`} id={id}>
      {children}
    </a>
  )
}
