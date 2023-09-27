/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import * as components from './AstroData.components'

function camelCaseToKebabCase(text: string) {
  return text
    .match(/[A-Z][a-z]*/g)
    ?.map((s) => s.toLowerCase())
    .join('-')
}

function getComponentsMap() {
  return new Map(
    Object.entries(components).map(([key, value]) => [
      camelCaseToKebabCase(key),
      value,
    ])
  )
}

const componentsMap = /* @__PURE__ */ getComponentsMap()

export function AstroData(props: JSX.IntrinsicElements['data']) {
  const component = componentsMap.get(props.className)
  return component ? component(props) : props.children
}
