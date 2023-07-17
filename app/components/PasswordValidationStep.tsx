import { Icon } from '@trussworks/react-uswds'

export default function PasswordValidationStep({
  valid,
  text,
}: {
  valid: boolean
  text: string
}) {
  return (
    <li>
      {valid ? (
        <Icon.Check color="green" aria-label="green check" />
      ) : (
        <Icon.Close color="red" aria-label="red x" />
      )}
      {text}
    </li>
  )
}
