/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import BaseReCAPTCHA from 'react-google-recaptcha'
import type { ReCAPTCHAProps } from 'react-google-recaptcha'

import { getEnvOrDieInProduction } from '~/lib/env.server'
import { useRecaptchaSiteKey } from '~/root'

export async function verifyRecaptcha(response?: string) {
  const secret = getEnvOrDieInProduction('RECAPTCHA_SITE_SECRET')
  if (!secret) return

  const params = new URLSearchParams()
  if (response) {
    params.set('response', response)
  }
  params.set('secret', secret)
  const verifyResponse = await fetch(
    'https://www.google.com/recaptcha/api/siteverify',
    { method: 'POST', body: params }
  )
  const { success } = await verifyResponse.json()
  if (!success) throw new Response('ReCAPTCHA was invalid', { status: 400 })
}

export function ReCAPTCHA(props: Omit<ReCAPTCHAProps, 'sitekey'>) {
  const recaptchaSiteKey = useRecaptchaSiteKey()

  return recaptchaSiteKey ? (
    <p className="usa-paragraph">
      <BaseReCAPTCHA sitekey={recaptchaSiteKey} {...props} />
    </p>
  ) : (
    <p className="text-base">
      You are working in a development environment, the ReCaptcha is currently
      hidden
    </p>
  )
}
