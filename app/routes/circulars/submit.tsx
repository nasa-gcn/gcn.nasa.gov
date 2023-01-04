import type { DataFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Link, Form } from '@remix-run/react'
import { Label, TextInput, Textarea, Button } from '@trussworks/react-uswds'
import { useState } from 'react'
import { getFormDataString } from '~/lib/utils'
import { getUser } from '../__auth/user.server'
import { CircularsServer } from './circulars.server'

interface FormProps {
  id?: string
  subject?: string
  body?: string
}

export async function loader({ request }: DataFunctionArgs) {
  const user = await getUser(request)
  if (!user || !user.groups.includes('gcn.nasa.gov/circular-submitter'))
    throw new Response('', { status: 403 })
  return { user }
}

export async function action({ request }: DataFunctionArgs) {
  const data = await request.formData()
  const body = getFormDataString(data, 'body')
  const subject = getFormDataString(data, 'subject')
  if (!body || !subject) throw new Response('', { status: 403 })
  const server = await CircularsServer.create(request)
  await server.createNewCircular(body, subject)

  return redirect('/circulars')
}

export default function Submit(props: FormProps) {
  const defaultSubjectValid = subjectIsValid(props.subject ?? '')
  const [subjectValid, setSubjectValid] = useState(defaultSubjectValid)
  const defaultBodyValid = !!props.body
  const [bodyValid, setBodyValid] = useState(defaultBodyValid)

  function checkSubject(value: string) {
    setSubjectValid(subjectIsValid(value))
  }

  return (
    <>
      <h1>Submit a Circular</h1>
      <Form method="post">
        <input type="hidden" name="id" value={props.id} />
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
