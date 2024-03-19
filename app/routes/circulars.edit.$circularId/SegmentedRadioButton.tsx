/*!
 * Copyright © 2023 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Button, ButtonGroup } from '@trussworks/react-uswds'
import { createContext, useContext, useId, useState } from 'react'

const SegmentedRadioButtonGroupContext = createContext<{
  name?: string
  selectedId?: ReturnType<typeof useState<string | undefined>>[0]
  setSelectedId?: ReturnType<typeof useState<string | undefined>>[1]
}>({})

/**
 * A container for SegmentedRadioButtons.
 */
export function SegmentedRadioButtonGroup({
  children,
  name,
  ...props
}: Omit<Parameters<typeof ButtonGroup>[0], 'segmented' | 'role'> & {
  name?: string
}) {
  const [selectedId, setSelectedId] = useState<string | undefined>()
  return (
    <SegmentedRadioButtonGroupContext.Provider
      value={{ name, selectedId, setSelectedId }}
    >
      <ButtonGroup type="segmented" role="radiogroup" {...props}>
        {children}
      </ButtonGroup>
    </SegmentedRadioButtonGroupContext.Provider>
  )
}

/**
 * An input that behaves like a radio button but looks like a segmented button.
 *
 * Like a normal radio button, at most one button within its group may be in a
 * checked state at any given time. Place inside a SegmentedRadioButtonGroup to
 * group it with other radio buttons.
 *
 * Like a normal radio button, if the button is in a checked state and has both
 * a name and a value, then it will be included in the form data when submitted.
 */
export function SegmentedRadioButton({
  children,
  value,
  defaultChecked,
  onClick,
  ...props
}: Omit<
  Parameters<typeof Button>[0],
  'type' | 'role' | 'aria-checked' | 'outline'
> & { value?: string }) {
  const id = useId()
  const { name, selectedId, setSelectedId } = useContext(
    SegmentedRadioButtonGroupContext
  )
  const checked = selectedId ? id === selectedId : defaultChecked
  return (
    <Button
      type="button"
      role="radio"
      aria-checked={checked}
      outline={!checked}
      value={value}
      onClick={(e) => {
        setSelectedId?.(id)
        return onClick?.(e)
      }}
      {...props}
    >
      {checked && name && value && (
        <input type="hidden" name={name} value={value} />
      )}
      {children}
    </Button>
  )
}
