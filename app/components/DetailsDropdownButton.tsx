import { Button, Icon } from '@trussworks/react-uswds'
import type { ButtonProps } from '@trussworks/react-uswds/lib/components/Button/Button'
import type { ReactNode } from 'react'

export default function DetailsDropdownButton({
  children,
  className,
  ...props
}: {
  children: ReactNode
  className?: string
} & Omit<ButtonProps & JSX.IntrinsicElements['button'], 'type'>) {
  return (
    <Button
      className={`usa-button ${className ?? ''}`}
      type="button"
      aria-controls="details-content"
      role="button"
      {...props}
    >
      {children}
      <Icon.ExpandMore />
    </Button>
  )
}
