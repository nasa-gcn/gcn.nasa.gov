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
      className={`${className ?? ''}`}
      type="button"
      aria-controls="details-content"
      {...props}
    >
      {children}
      <Icon.ExpandMore />
    </Button>
  )
}
