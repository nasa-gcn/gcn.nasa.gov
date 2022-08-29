/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { Checkbox } from '@trussworks/react-uswds'
import { useEffect, useRef, useState } from 'react'

type CheckboxArgs = Parameters<typeof Checkbox>
type CheckboxProps = CheckboxArgs[0]
interface NestedCheckboxProps extends CheckboxProps {
  nodes: CheckboxProps[]
}

function allTrue(values: boolean[]) {
  return values.every(Boolean)
}

function allSame([first, ...rest]: any[]) {
  return rest.every((value) => value === first)
}

function NestedCheckboxNode({
  nodes,
  ...topLevelNodeProps
}: NestedCheckboxProps) {
  const [expanded, setExpanded] = useState(false)
  const topLevelRef = useRef<HTMLInputElement>(null)
  const childRefs = useRef<(HTMLInputElement | null)[]>(
    new Array(nodes.length).fill(null)
  )
  const [topLevelValue, setTopLevelValue] = useState(false)
  const [childValues, setChildValues] = useState(
    nodes.map((node) => node.defaultChecked || false)
  )

  function updateParent() {
    if (topLevelRef.current) {
      topLevelRef.current.checked = allTrue(childValues)
      topLevelRef.current.indeterminate = !allSame(childValues)
    }
  }

  useEffect(updateParent)

  return (
    <li
      role="treeitem"
      aria-expanded={expanded}
      onClick={() => setExpanded(!expanded)}
      className="nested-checkboxes__node"
    >
      <Checkbox
        className="display-inline-block"
        {...topLevelNodeProps}
        inputRef={topLevelRef}
        onClick={() => {
          const checked = !topLevelValue
          setTopLevelValue(checked)
          setChildValues(childValues.fill(checked))
          if (topLevelRef.current) {
            topLevelRef.current.indeterminate = false
          }
          childRefs.current.forEach((childRef) => {
            if (childRef) {
              childRef.checked = checked
            }
          })
        }}
      />
      <ul hidden={!expanded} className="nested-checkboxes__leaf">
        {nodes.map((node, index) => (
          <li role="treeitem" key={index}>
            <Checkbox
              {...node}
              inputRef={(instance) => {
                childRefs.current[index] = instance
              }}
              onChange={(e) => {
                childValues[index] = e.target.checked
                setChildValues(childValues)
                updateParent()
              }}
            />
          </li>
        ))}
      </ul>
    </li>
  )
}

export function NestedCheckboxes({ nodes }: { nodes: NestedCheckboxProps[] }) {
  return (
    <ul role="tree" aria-multiselectable>
      {nodes.map((node, index) => (
        <NestedCheckboxNode key={index} {...node} />
      ))}
    </ul>
  )
}
