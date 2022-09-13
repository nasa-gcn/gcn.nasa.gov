/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { Form, Link } from '@remix-run/react'
import { Label, TextInput, Textarea, Button } from '@trussworks/react-uswds'
import { useState } from 'react'
import { parseEventFromSubject } from '~/lib/utils'

interface FormProps {
  id?: string
  subject?: string
  body?: string
  linkedEvent?: string
}

export default function CircularsEditForm(props: FormProps) {
  const [linkedEvent, setLinkedEvent] = useState(props.linkedEvent ?? '')
  const defaultSubjectValid = subjectIsValid(props.subject ?? '')
  const [subjectValid, setSubjectValid] = useState(defaultSubjectValid)
  const defaultBodyValid = !!props.body
  const [bodyValid, setBodyValid] = useState(defaultBodyValid)

  function checkSubject(value: string) {
    setSubjectValid(subjectIsValid(value))
    if (subjectValid) {
      setLinkedEvent(parseEventFromSubject(value))
    } else {
      setLinkedEvent('Subject line is invalid')
    }
  }

  return (
    <>
      <Form method="post" action="/api/circulars">
        <input type="hidden" name="id" value={props.id} />
        <input type="hidden" name="linkedEvent" value={linkedEvent} />
        <div>
          <p>Create and submit a new GCN Circular</p>
          <p className="text-base maxw-full">
            See the <Link to="/docs/styleguide">guide</Link> for more
            information. Some of the requirements will be enforced here on
            submit. (ex. Do not submit a Circular without a specified event in
            the title)
          </p>
        </div>
        <Label htmlFor="subject">
          Subject
          <abbr title="required" className="usa-label--required">
            *
          </abbr>
        </Label>
        <small className="text-base maxw-full">
          The subject line should start with the name of the transient which
          must be one of the <Link to="">known keywords</Link>. (Contact us for
          new keyword requests)
        </small>
        <TextInput
          name="subject"
          id="subject"
          type="text"
          className="maxw-full"
          placeholder="Subject"
          defaultValue={props.subject}
          required={true}
          onChange={(e) => checkSubject(e.target.value)}
        />
        <Label htmlFor="linkedEvent">Linked Event</Label>
        <small className="text-base">
          The linked event is parsed from the subject line. This field is
          generated based on the subject input and can not be changed manually.
          Please make sure your subject line is properly formatted to ensure
          this field is correct
        </small>
        <TextInput
          disabled
          id="linkedEvent"
          name="linkedEvent"
          type="text"
          defaultValue={props.linkedEvent}
          className="maxw-full"
          value={linkedEvent}
        />
        <Label htmlFor="body">
          Body
          <abbr title="required" className="usa-label--required">
            *
          </abbr>
        </Label>
        <small className="text-base">
          Follow the formatting described in the{' '}
          <Link to="">GCN Style Guide</Link>.
        </small>
        <Textarea
          name="body"
          id="body"
          required={true}
          defaultValue={props.body}
          className="maxw-full"
          onChange={(e) => setBodyValid(!!e.target.value)}
        />
        <div className="grid-row margin-top-3">
          <div className="tablet:grid-col-9 flex-fill"></div>
          <div className="flex-auto ">
            <Link
              to=".."
              type="button"
              className="usa-button usa-button--outline"
            >
              Back
            </Link>
            <Button
              disabled={!(subjectValid && bodyValid)}
              type="submit"
              className="margin-right-0"
            >
              Submit
            </Button>
          </div>
        </div>
      </Form>
    </>
  )
}

function subjectIsValid(value: string) {
  // Full subject rules,
  return true
}
