import { Button, Icon } from '@trussworks/react-uswds'
import type { ButtonProps } from '@trussworks/react-uswds/lib/components/Button/Button'
import type { ReactNode } from 'react'

export default function DetailsDropdownControl({
  children,
  className,
  onClick,
  ...props
}: {
  children: ReactNode
  className?: string
  onClick: () => void
} & Omit<ButtonProps, 'type' | 'role'>) {
  return (
    <Button
      className={`usa-button ${className}`}
      type="button"
      onClick={onClick}
      aria-controls="details-content"
      role="button"
      {...props}
    >
      <span className="margin-right-auto">{children}</span>
      <Icon.UnfoldMore />
    </Button>
  )
}
