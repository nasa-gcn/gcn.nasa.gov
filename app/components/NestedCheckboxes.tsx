/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { Link } from '@remix-run/react'
import { Checkbox } from '@trussworks/react-uswds'
import { useEffect, useRef, useState } from 'react'

type CheckboxArgs = Parameters<typeof Checkbox>
type CheckboxProps = CheckboxArgs[0]
interface NestedCheckboxProps extends CheckboxProps {
  nodes: CheckboxProps[]
  link?: string
  childoncheckhandler?: (arg: HTMLInputElement) => void
}

function allTrue(values: boolean[]) {
  return values.every(Boolean)
}

function allSame([first, ...rest]: any[]) {
  return rest.every((value) => value === first)
}

function isExternalLink(link: string): boolean {
  return link.startsWith('https://') || link.startsWith('http://')
}

function NestedCheckboxNode({
  nodes,
  link,
  childoncheckhandler = () => null,
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

  const isExternal = link && isExternalLink(link)

  function updateParent() {
    if (topLevelRef.current) {
      topLevelRef.current.checked = allTrue(childValues)
      topLevelRef.current.indeterminate = !allSame(childValues)
    }
  }

  useEffect(updateParent)
  useEffect(() => {
    for (const ref in childRefs.current) {
      const childRef = childRefs.current[ref]
      if (childRef != null) {
        childoncheckhandler(childRef)
      }
    }
  })

  return (
    <li
      role="treeitem"
      aria-expanded={expanded}
      aria-selected={false}
      onClick={() => setExpanded(!expanded)}
      className="nested-checkboxes__node"
    >
      <Checkbox
        className="display-inline-block"
        {...topLevelNodeProps}
        label={
          <>
            <span className="padding-right-1">{topLevelNodeProps.label}</span>
            {link && (
              <Link
                to={link}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noreferrer' : undefined}
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                Details
              </Link>
            )}
          </>
        }
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
          <li role="treeitem" key={index} aria-selected={false}>
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

interface NestedCheckboxesProps {
  nodes: NestedCheckboxProps[]
  childoncheckhandler?: (arg: HTMLInputElement) => void
}

export function NestedCheckboxes({
  nodes,
  childoncheckhandler,
}: NestedCheckboxesProps) {
  return (
    <ul role="tree" aria-multiselectable>
      {nodes.map((node, index) => (
        <NestedCheckboxNode
          key={index}
          {...node}
          childoncheckhandler={childoncheckhandler}
        />
      ))}
    </ul>
  )
}
