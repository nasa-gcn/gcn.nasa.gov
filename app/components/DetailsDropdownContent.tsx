/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Card, CardGroup } from '@trussworks/react-uswds'
import { useEffect, useRef } from 'react'

export default function DetailsDropdownContent({
  children,
  onClose,
  ...props
}: Parameters<typeof Card>[0] & { onClose?: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        if (onClose) onClose()
      }
    }
    document.body.addEventListener('click', handleClickOutside)
    return () => {
      document.body.removeEventListener('click', handleClickOutside)
    }
  }, [onClose])

  return (
    <div ref={contentRef}>
      <CardGroup className="position-absolute margin-top-1 z-top" role="menu">
        <Card {...props}>{children}</Card>
      </CardGroup>
    </div>
  )
}
