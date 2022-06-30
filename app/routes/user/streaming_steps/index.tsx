import { Link } from '@remix-run/react'
import { steps, useClient } from '../streaming_steps'

export default function StreamingSteps() {
  const clientData = useClient()
  return (
    <div className="usa-prose">
      <p>
        Keys are bound to your unique account. For example, choosing the "Sign
        in with Google" option will sign in with a different account than if you
        use that same gmail address in the standard email sign in form. Make
        sure you sign in the same way each time to keep your credentials
        together.
      </p>
      <Link
        type="button"
        className="usa-button"
        to="credentials"
        onClick={() => clientData.setActiveStep(steps[1])}
      >
        Credentials
      </Link>
    </div>
  )
}
