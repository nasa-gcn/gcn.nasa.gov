/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

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
