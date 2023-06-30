/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { redirect } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { Button, Label, TextInput } from '@trussworks/react-uswds'
import { useState } from 'react'

import { PasswordManager } from '../routes/user/password.server'
import { getFormDataString } from '~/lib/utils'

export async function handlePasswordActions(
  request: Request,
  redirectSource: string
) {
  const data = await request.formData()
  const oldPassword = getFormDataString(data, 'oldPassword')
  const newPassword = getFormDataString(data, 'newPassword')
  const confirmPassword = getFormDataString(data, 'confirmPassword')

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new Response('all password fields must be present', { status: 400 })
  }

  if (newPassword != confirmPassword) {
    throw new Response('passwords must match', { status: 400 })
  } else {
    const passwordManager = await PasswordManager.create(
      request,
      oldPassword,
      newPassword
    )
    await passwordManager.updatePassword()
    return redirect('/user')
  }
}

export function PasswordResetForm() {
  const checkPassword = (str: string) => {
    var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/
    return re.test(str)
  }
  const startsOrEndsWithWhitespace = (str: string) => {
    return /^\s|\s$/.test(str)
  }
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isNewPasswordTouched, setIsNewPasswordTouched] = useState(false)
  const [isConfirmPasswordTouched, setIsConfirmPasswordTouched] =
    useState(false)
  const passwordsMatch = newPassword === confirmPassword
  const passwordsAreEmpty = newPassword === '' && confirmPassword === ''
  const shouldDisableSubmit =
    passwordsAreEmpty || !isNewPasswordTouched || !passwordsMatch
  const isMatchError =
    !isConfirmPasswordTouched || passwordsMatch ? '' : 'usa-input--error'

  const valid =
    !startsOrEndsWithWhitespace(newPassword) && checkPassword(newPassword)
  const isValidPassword =
    !isNewPasswordTouched || valid ? '' : 'usa-input--error'

  return (
    <Form method="POST">
      <Label htmlFor="oldPassword">Old Password</Label>
      <TextInput
        data-focus
        name="oldPassword"
        id="oldPassword"
        type="password"
        placeholder="Old Password"
      />
      <Label htmlFor="newPassword">New Password</Label>
      <TextInput
        data-focus
        className={isValidPassword}
        name="newPassword"
        id="newPassword"
        type="password"
        placeholder="New Password"
        onChange={(e) => {
          setNewPassword(e.target.value)
          setIsNewPasswordTouched(true)
        }}
        value={newPassword}
      />
      <Label htmlFor="confirmPassword">Retype New Password</Label>
      <TextInput
        data-focus
        className={isMatchError}
        name="confirmPassword"
        id="confirmPassword"
        type="password"
        placeholder="Retype New Password"
        onChange={(e) => {
          setConfirmPassword(e.target.value)
          setIsNewPasswordTouched(true)
          setIsConfirmPasswordTouched(true)
        }}
        value={confirmPassword}
      />

      <Button
        className="margin-y-2"
        disabled={shouldDisableSubmit}
        type="submit"
      >
        Reset Password
      </Button>
    </Form>
  )
}
