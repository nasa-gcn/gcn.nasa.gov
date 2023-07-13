/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { DataFunctionArgs } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import {
  Button,
  ButtonGroup,
  Icon,
  InputGroup,
  Label,
  TextInput,
} from '@trussworks/react-uswds'
import { useEffect, useRef, useState } from 'react'

import { getUser } from '../__auth/user.server'
import { updatePassword } from './password.server'
import Spinner from '~/components/Spinner'
import { getFormDataString } from '~/lib/utils'
import { useUserIdp } from '~/root'

export const handle = {
  breadcrumb: 'Reset Password',
  getSitemapEntries: () => null,
}

export async function loader({ request }: DataFunctionArgs) {
  const user = await getUser(request)
  if (!user) throw new Response(null, { status: 403 })
  return null
}

export async function action({ request }: DataFunctionArgs) {
  const data = await request.formData()
  const oldPassword = getFormDataString(data, 'oldPassword')
  const newPassword = getFormDataString(data, 'newPassword')

  let response = null
  if (oldPassword && newPassword) {
    response = await updatePassword(request, oldPassword, newPassword)
  }

  return response
}

export default function () {
  const idp = useUserIdp()
  if (idp)
    throw new Error(
      'you must be logged in with a user name and password to reest password'
    )
  const fetcher = useFetcher<typeof action>()
  const errorMessage = fetcher.data
  const checkPassword = (str: string) => {
    var re =
      /^(?=.*\d)(?=.*[~`!@#$%^&*.+=\-_ [\]\\';,/{}()|\\":<>?])(?=.*[a-z])(?=.*[A-Z]).{8,}$/
    return re.test(str)
  }
  const checkWhitespace = (str: string) => {
    return /^\s|\s$/.test(str)
  }

  const [newPassword, setNewPassword] = useState('')
  const [isOldPasswordTouched, setIsOldPasswordTouched] = useState(false)
  const [isNewPasswordTouched, setIsNewPasswordTouched] = useState(false)
  const [visible, setVisible] = useState(false)

  const containsLower = /[a-z]/.test(newPassword)
  const containsUpper = /[A-Z]/.test(newPassword)
  const containsNumber = /[0-9]/.test(newPassword)
  const validLength = newPassword.length >= 8
  const containsSpecialChar = /[~`!@#$%^.&*+=\-_ [\]\\';,/{}()|\\":<>?]/g.test(
    newPassword
  )
  const leadingOrTrailingSpace =
    newPassword.length !== newPassword.trim().length
  const oldPasswordError = errorMessage && !isOldPasswordTouched
  const valid = !checkWhitespace(newPassword) && checkPassword(newPassword)
  const shouldDisableSubmit =
    !newPassword || !isNewPasswordTouched || !valid || !isOldPasswordTouched
  let isError
  if (isNewPasswordTouched && valid) {
    isError = false
  }
  if (isNewPasswordTouched && !valid) {
    isError = true
  }
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (formRef.current && fetcher.state === 'submitting') {
      formRef.current.reset()
    }
  }, [fetcher.state])

  return (
    <>
      <h1>Reset Password</h1>
      <>
        <fetcher.Form method="POST" ref={formRef}>
          <Label htmlFor="oldPassword">Old Password</Label>
          <TextInput
            data-focus
            className={oldPasswordError ? 'usa-input--error' : ''}
            name="oldPassword"
            id="oldPassword"
            type="password"
            placeholder="Old Password"
            onChange={(e) => {
              setIsOldPasswordTouched(true)
            }}
          />
          {errorMessage === 'NotAuthorizedException' && (
            <span className="text-red">Invalid Password</span>
          )}
          {errorMessage === 'LimitExceededException' && (
            <span className="text-red">
              Attempts Exceeded. Please try again later.
            </span>
          )}
          <Label htmlFor="newPassword">New Password</Label>
          <InputGroup error={isError}>
            <TextInput
              name="newPassword"
              id="newPassword"
              className={
                !isError && isNewPasswordTouched ? 'usa-input--success' : ''
              }
              type={visible ? 'text' : 'password'}
              placeholder="New Password"
              onChange={(e) => {
                setNewPassword(e.target.value)
                setIsNewPasswordTouched(true)
              }}
              value={newPassword}
            />
            {visible && (
              <div className="usa-input-suffix" aria-hidden="true">
                <Icon.VisibilityOff
                  className="margin-y-2"
                  onClick={() => {
                    setVisible(!visible)
                  }}
                />
              </div>
            )}
            {!visible && (
              <div className="usa-input-suffix" aria-hidden="true">
                <Icon.Visibility
                  className="margin-y-2"
                  onClick={() => {
                    setVisible(!visible)
                  }}
                />
              </div>
            )}
          </InputGroup>
          <ButtonGroup>
            <Button
              disabled={shouldDisableSubmit}
              type="submit"
              className="margin-y-2"
            >
              Reset Password
            </Button>
          </ButtonGroup>
          {fetcher.state !== 'idle' && (
            <>
              <Spinner /> Saving...
            </>
          )}
          {fetcher.state === 'idle' &&
            fetcher.data !== undefined &&
            fetcher.data !== 'NotAuthorizedException' &&
            fetcher.data !== 'LimitExceededException' && (
              <>
                <Icon.Check color="green" /> Saved
              </>
            )}
        </fetcher.Form>
      </>

      <div className="usa-alert usa-alert--info usa-alert--validation">
        <div className="usa-alert__body">
          <h3 className="site-preview-heading margin-0 usa-alert__heading">
            New password must contain:
          </h3>
          <ul className="usa-checklist" id="validate-code">
            <li>
              {containsLower && (
                <>
                  <Icon.Check color="green" />
                </>
              )}
              {!containsLower && (
                <>
                  <Icon.Close color="red" />
                </>
              )}
              A lower case letter
            </li>
            <li>
              {containsUpper && (
                <>
                  <Icon.Check color="green" />
                </>
              )}
              {!containsUpper && (
                <>
                  <Icon.Close color="red" />
                </>
              )}
              An upper case letter
            </li>
            <li>
              {containsNumber && (
                <>
                  <Icon.Check color="green" />
                </>
              )}
              {!containsNumber && (
                <>
                  <Icon.Close color="red" />
                </>
              )}
              A number
            </li>
            <li>
              {validLength && (
                <>
                  <Icon.Check color="green" />
                </>
              )}
              {!validLength && (
                <>
                  <Icon.Close color="red" />
                </>
              )}
              At least 8 characters
            </li>
            <li>
              {containsSpecialChar && (
                <>
                  <Icon.Check color="green" />
                </>
              )}
              {!containsSpecialChar && (
                <>
                  <Icon.Close color="red" />
                </>
              )}
              At least 1 special character or space
            </li>
            <li>
              {!leadingOrTrailingSpace && (
                <>
                  <Icon.Check color="green" />
                </>
              )}
              {leadingOrTrailingSpace && (
                <>
                  <Icon.Close color="red" />
                </>
              )}
              No leading or trailing spaces
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
