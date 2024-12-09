/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SEOHandle } from '@nasa-gcn/remix-seo'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import {
  Form,
  Link,
  useFetcher,
  useLoaderData,
  useSubmit,
} from '@remix-run/react'
import type { ModalRef } from '@trussworks/react-uswds'
import {
  Button,
  ButtonGroup,
  CardBody,
  FormGroup,
  Grid,
  Icon,
  Modal,
  ModalFooter,
  ModalHeading,
  ModalToggleButton,
  TextInput,
} from '@trussworks/react-uswds'
import { useEffect, useRef, useState } from 'react'
import invariant from 'tiny-invariant'
import { useOnClickOutside } from 'usehooks-ts'

import { getUser } from './_auth/user.server'
import { moderatorGroup } from './circulars/circulars.server'
import {
  autoCompleteEventIds,
  deleteSynonyms,
  getSynonymsByUuid,
  putSynonyms,
} from './synonyms/synonyms.server'
import DetailsDropdownContent from '~/components/DetailsDropdownContent'
import { ToolbarButtonGroup } from '~/components/ToolbarButtonGroup'
import { getFormDataString } from '~/lib/utils'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: 'Edit',
  getSitemapEntries: () => null,
}

export async function loader({
  request,
  params: { synonymId },
}: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user?.groups.includes(moderatorGroup))
    throw new Response(null, { status: 403 })

  invariant(synonymId)
  const synonyms = await getSynonymsByUuid(synonymId)
  const eventIds = synonyms.map((synonym) => synonym.eventId)
  const url = new URL(request.url)
  const query = url.searchParams.get('query')
  const { options } = query
    ? await autoCompleteEventIds({ query })
    : { options: [] }

  return {
    eventIds,
    options,
  }
}

export async function action({
  request,
  params: { synonymId },
}: ActionFunctionArgs) {
  invariant(synonymId)
  const data = await request.formData()
  const intent = getFormDataString(data, 'intent')

  if (intent === 'edit') {
    const additions = data.getAll('addSynonyms') as string[]
    const subtractions = data.getAll('deleteSynonyms') as string[]

    await putSynonyms({
      synonymId,
      additions,
      subtractions,
    })

    return null
  } else if (intent === 'delete') {
    await deleteSynonyms(synonymId)
    return redirect('/synonyms')
  } else {
    throw new Response('Unknown intent.', {
      status: 400,
    })
  }
}

export default function () {
  const { eventIds, options } = useLoaderData<typeof loader>()
  const uniqueOptions = Array.from(new Set(options))
  const [deleteSynonyms, setDeleteSynonyms] = useState<string[]>([])
  const [synonyms, setSynonyms] = useState<string[]>(eventIds || [])
  const [addSynonyms, setAddSynonyms] = useState<string[]>([])
  const uniqueSynonyms = Array.from(new Set(synonyms))
  const [input, setInput] = useState('')
  const modalRef = useRef<ModalRef>(null)
  const ref = useRef<HTMLDivElement>(null)
  const fetcher = useFetcher()
  const submit = useSubmit()

  const [showContent, setShowContent] = useState(false)
  useOnClickOutside(ref, () => {
    setShowContent(false)
  })

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (input.length >= 3)
        submit({ query: input }, { preventScrollReset: true })
    }, 3000)

    return () => clearTimeout(delayDebounceFn)
  }, [input, submit])

  return (
    <>
      <ToolbarButtonGroup className="flex-wrap">
        <Link to="/synonyms" className="usa-button flex-align-stretch">
          <div className="position-relative">
            <Icon.ArrowBack
              role="presentation"
              className="position-absolute top-0 left-0"
            />
          </div>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Back
        </Link>
        <ModalToggleButton modalRef={modalRef} opener type="button">
          <Icon.Delete
            role="presentation"
            className="bottom-aligned margin-right-05"
          />{' '}
          Delete
        </ModalToggleButton>
      </ToolbarButtonGroup>
      <h1>Synonym Group</h1>
      <p>
        If you are adding an event identifier that is already part of a group,
        it will be removed from the previous association and added to this
        group.
      </p>
      <Grid row>
        <fetcher.Form method="get">
          <TextInput
            className="border-1px"
            autoComplete="off"
            type="search"
            name="query"
            value={input}
            onChange={({ target: { form, value } }) => {
              setInput(value)
              setShowContent(true)
              if (value.length >= 3) submit(form, { preventScrollReset: true })
            }}
            id="query-input"
          />
        </fetcher.Form>
      </Grid>
      {uniqueOptions.length && input && showContent ? (
        <div ref={ref}>
          <DetailsDropdownContent>
            <CardBody>
              {uniqueOptions.map((eventId: string) => (
                <div
                  key={eventId}
                  className="hover:bg-primary-lighter"
                  onClick={() => {
                    setSynonyms([...synonyms, eventId])
                    setAddSynonyms(
                      Array.from(new Set([...addSynonyms, eventId]))
                    )
                    setDeleteSynonyms(
                      deleteSynonyms.filter(function (item) {
                        return item !== eventId
                      })
                    )
                    setInput('')
                  }}
                >
                  {eventId}
                </div>
              ))}
            </CardBody>
          </DetailsDropdownContent>
        </div>
      ) : null}
      <Form
        method="POST"
        onSubmit={() => {
          setAddSynonyms([])
          setDeleteSynonyms([])
        }}
      >
        <input type="hidden" name="intent" value="edit" />
        <FormGroup>
          {addSynonyms.map((synonym) => (
            <input
              key={synonym}
              type="hidden"
              name="addSynonyms"
              value={synonym}
              id={`add-${synonym}`}
            />
          ))}
          {deleteSynonyms.map((synonym) => (
            <input
              key={synonym}
              type="hidden"
              name="deleteSynonyms"
              value={synonym}
              id={`delete-${synonym}`}
            />
          ))}
          <ul className="usa-list usa-list--unstyled">
            {uniqueSynonyms?.map((synonym) => (
              <li key={synonym}>
                <ButtonGroup>
                  {synonym}
                  <Button
                    className="usa-button--unstyled"
                    type="button"
                    onClick={() => {
                      setDeleteSynonyms((oldArray) => [...oldArray, synonym])
                      setSynonyms(
                        synonyms.filter(function (item) {
                          return item !== synonym
                        })
                      )
                      setAddSynonyms(
                        addSynonyms.filter(function (item) {
                          return item !== synonym
                        })
                      )
                    }}
                  >
                    Remove
                  </Button>
                </ButtonGroup>
              </li>
            ))}
          </ul>
        </FormGroup>
        <FormGroup>
          <Button
            type="submit"
            disabled={!addSynonyms.length && !deleteSynonyms.length}
          >
            Save
          </Button>
        </FormGroup>
      </Form>
      <Modal
        ref={modalRef}
        id="example-modal-1"
        aria-labelledby="modal-1-heading"
        aria-describedby="modal-1-description"
        renderToPortal={false}
      >
        <ModalHeading id="modal-1-heading">
          Are you sure you want to continue?
        </ModalHeading>
        <div className="usa-prose">
          <p id="modal-1-description">
            You are about to permanently delete this Synonym Group.
          </p>
        </div>
        <ModalFooter>
          <ButtonGroup>
            <Form method="POST">
              <input type="hidden" name="intent" value="delete" />
              <Button type="submit" outline>
                <Icon.Delete
                  role="presentation"
                  className="bottom-aligned margin-right-05"
                />{' '}
                Delete
              </Button>
            </Form>
            <ModalToggleButton
              modalRef={modalRef}
              closer
              unstyled
              className="padding-105 text-center"
            >
              Cancel
            </ModalToggleButton>
          </ButtonGroup>
        </ModalFooter>
      </Modal>
    </>
  )
}
