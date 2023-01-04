import { Editor } from '@bytemd/react'
import gfm from '@bytemd/plugin-gfm'
import math from '@bytemd/plugin-math'
import { useState } from 'react'
import styles from 'bytemd/dist/index.css'
import type { DataFunctionArgs, LinksFunction } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { Button, ButtonGroup, Icon, TextInput } from '@trussworks/react-uswds'
import { formatAuthor } from './user/index'
import { getUser } from './__auth/user.server'

export const handle = { breadcrumb: 'Astro Flavored Markdown' }

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }]

export async function loader({ request }: DataFunctionArgs) {
  const user = await getUser(request)
  if (!user) throw new Response('Not signed in', { status: 403 })
  const formattedAuthor = formatAuthor(user)
  return { formattedAuthor }
}

export default function AstroFlavoredMarkdown() {
  const { formattedAuthor } = useLoaderData<typeof loader>()
  const [value, setValue] = useState('')
  const date = new Date()
  const titlePlaceholder = `GRB ${(date.getUTCFullYear() % 1000)
    .toString()
    .padStart(2, '0')}${date.getUTCMonth().toString().padStart(2, '0')}${date
    .getUTCDay()
    .toString()
    .padStart(2, '0')}A: observations of a gamma-ray burst`

  return (
    <Form>
      <h1>New GCN Circular</h1>
      <div className="usa-input-group border-0 maxw-full">
        <div className="usa-input-prefix" aria-hidden>
          From
        </div>
        <span className="padding-1">{formattedAuthor}</span>
        <Link to="/user">
          <Button unstyled type="button">
            <Icon.Edit /> Edit
          </Button>
        </Link>
      </div>
      <div className="usa-input-group maxw-full">
        <div className="usa-input-prefix" aria-hidden>
          Title
        </div>
        <TextInput
          name="title"
          id="title"
          type="text"
          placeholder={titlePlaceholder}
        />
      </div>
      <Editor
        placeholder="Isaac Newton, Albert Einstein, Stephen Hawking, Worf Son of Mogh, Geordi LaForge, Beverly Crusher, Deanna Troi, and Data Soong report on behalf of a larger collaboration:"
        value={value}
        onChange={(v) => {
          setValue(v)
        }}
        plugins={[gfm(), math()]}
      />
      <ButtonGroup>
        <Button type="button" outline>
          Cancel
        </Button>
        <Button type="submit">Send</Button>
      </ButtonGroup>
    </Form>
  )
}
