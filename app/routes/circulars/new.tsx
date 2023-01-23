/*!
 * Copyright © 2023 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import classnames from 'classnames'
import type { DataFunctionArgs } from '@remix-run/node'
import { Link, Form, useNavigation, useLoaderData } from '@remix-run/react'
import {
  TextInput,
  Textarea,
  Button,
  ButtonGroup,
  Icon,
} from '@trussworks/react-uswds'
import { useState } from 'react'
import dedent from 'ts-dedent'
import Spinner from '~/components/Spinner'
import { formatAuthor } from '../user/index'
import { getUser } from '../__auth/user.server'
import { bodyIsValid, subjectIsValid } from './circulars.lib'
import { feature } from '~/root'

export async function loader({ request }: DataFunctionArgs) {
  if (!feature('circulars')) throw new Response(null, { status: 404 })
  const user = await getUser(request)
  if (!user || !user.groups.includes('gcn.nasa.gov/circular-submitter'))
    throw new Response(null, { status: 403 })
  const formattedAuthor = formatAuthor(user)
  return { formattedAuthor }
}

function useSubjectPlaceholder() {
  const date = new Date()
  return `GRB ${(date.getUTCFullYear() % 1000)
    .toString()
    .padStart(2, '0')}${date.getUTCMonth().toString().padStart(2, '0')}${date
    .getUTCDay()
    .toString()
    .padStart(2, '0')}A: observations of a gamma-ray burst`
}

function useBodyPlaceholder() {
  return dedent(`
    Worf Son of Mogh (Starfleet), Geordi LaForge (Starfleet), Beverly Crusher (Starfleet), Deanna Troi (Starfleet), Data Soong (Starfleet), Isaac Newton (Cambridge), Stephen Hawking (Cambridge), and Albert Einstein (Institute for Advanced Study) report on behalf of a larger collaboration:

    ...
    `)
}

export default function New() {
  const { formattedAuthor } = useLoaderData<typeof loader>()
  const [subjectValid, setSubjectValid] = useState<boolean | undefined>()
  const [bodyValid, setBodyValid] = useState<boolean | undefined>()
  const sending = Boolean(useNavigation().formData)
  const valid = subjectValid && bodyValid

  return (
    <>
      <h1>New GCN Circular</h1>
      <Form method="post" action="/circulars">
        <div className="usa-input-group border-0 maxw-full">
          <div className="usa-input-prefix" aria-hidden>
            From
          </div>
          <span className="padding-1">{formattedAuthor}</span>
          <Link
            to="/user"
            title="Adjust how your name and affiliation appear in new GCN Circulars"
          >
            <Button unstyled type="button">
              <Icon.Edit /> Edit
            </Button>
          </Link>
        </div>
        <div
          className={classnames('usa-input-group', 'maxw-full', {
            'usa-input--error': subjectValid === false,
            'usa-input--success': subjectValid,
          })}
        >
          <div className="usa-input-prefix" aria-hidden>
            Subject
          </div>
          <TextInput
            aria-describedby="subjectDescription"
            className="maxw-full"
            name="subject"
            id="subject"
            type="text"
            placeholder={useSubjectPlaceholder()}
            required={true}
            onChange={({ target: { value } }) => {
              setSubjectValid(subjectIsValid(value))
            }}
          />
        </div>
        <div className="text-base margin-bottom-1" id="subjectDescription">
          <small>
            The subject line must start with the name of the transient, which
            must start with one of the{' '}
            <Link to="/circulars#submission-process">known keywords</Link>. (
            <a href="https://heasarc.gsfc.nasa.gov/cgi-bin/Feedback?selected=kafkagcn">
              Contact us
            </a>{' '}
            to add new keywords.)
          </small>
        </div>
        <label hidden htmlFor="body">
          Body
        </label>
        <Textarea
          name="body"
          id="body"
          aria-describedby="bodyDescription"
          placeholder={useBodyPlaceholder()}
          required={true}
          className={classnames('maxw-full', {
            'usa-input--success': bodyValid,
          })}
          onChange={({ target: { value } }) => {
            setBodyValid(bodyIsValid(value))
          }}
        />
        <div className="text-base margin-bottom-1" id="bodyDescription">
          <small>
            Body text. If this is your first Circular, please review the{' '}
            <Link to="/docs/styleguide">style guide</Link>.
          </small>
        </div>
        <ButtonGroup>
          <Link to="/circulars" className="usa-button usa-button--outline">
            Back
          </Link>
          <Button disabled={sending || !valid} type="submit">
            Send
          </Button>
          {sending && (
            <div className="padding-top-1 padding-bottom-1">
              <Spinner /> Sending...
            </div>
          )}
        </ButtonGroup>
      </Form>
    </>
  )
}
