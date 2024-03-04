/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  type ReactNode,
  createContext,
  useContext,
  useId,
  useState,
} from 'react'

type Id = ReturnType<typeof useId> | undefined
const context = createContext<Partial<ReturnType<typeof useState<Id>>>>([])

/**
 * A container for React nodes with abstract radio button like functionality.
 */
export function ExclusiveOptionGroup({ children }: { children?: ReactNode }) {
  const value = useState<Id>()
  return <context.Provider value={value}>{children}</context.Provider>
}

/**
 * A React node with abstract radio button like functionality.
 */
export function useExclusiveOption(defaultSelected: boolean = false) {
  const myId = useId()
  const [selectedId, setSelectedId] = useContext(context)
  const selected = selectedId ? myId === selectedId : defaultSelected

  function setSelected() {
    setSelectedId?.(myId)
  }

  return [selected, setSelected] as const
}
