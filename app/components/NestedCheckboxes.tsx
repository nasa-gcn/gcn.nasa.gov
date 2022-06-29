/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { Accordion, Checkbox } from '@trussworks/react-uswds'
import { useRef } from 'react'

type CheckboxArgs = Parameters<typeof Checkbox>
type CheckboxProps = CheckboxArgs[0]
interface NestedCheckboxProps extends CheckboxProps {
  nodes: CheckboxProps[]
}

function NestedCheckboxNode({
  nodes,
  ...topLevelNodeProps
}: NestedCheckboxProps) {
  const topLevelRef = useRef<HTMLInputElement>(null)
  const childRefs = useRef<(HTMLInputElement | null)[]>(nodes.map(() => null))
  const childValues = nodes.map(() => false)

  function updateParent() {
    const first = childValues[0]
    if (topLevelRef.current) {
      topLevelRef.current.checked = childValues.every(Boolean)
      topLevelRef.current.indeterminate = !childValues.every(
        (value) => value == first
      )
    }
  }

  return {
    title: (
      <Checkbox
        key={topLevelNodeProps.id}
        {...topLevelNodeProps}
        inputRef={topLevelRef}
        onClick={(e) => {
          if (!topLevelRef.current) return
          const checked = topLevelRef.current.checked
          childRefs.current.forEach((childRef, index) => {
            childValues[index] = checked
            if (childRef) {
              childRef.checked = checked
            }
          })
          updateParent()
        }}
      />
    ),
    content: nodes.map((node, index) => (
      <Checkbox
        key={node.id}
        {...node}
        inputRef={(instance) => {
          childRefs.current[index] = instance
        }}
        onChange={(e) => {
          childValues[index] = e.target.checked
          updateParent()
        }}
      />
    )),
  }
}

export function NestedCheckboxes({
  nodes: topLevelNodes,
}: {
  nodes: NestedCheckboxProps[]
}) {
  return (
    <Accordion
      multiselectable
      items={topLevelNodes.map((args) => {
        return {
          id: args.id,
          expanded: false,
          ...NestedCheckboxNode(args),
        }
      })}
    />
  )
}
