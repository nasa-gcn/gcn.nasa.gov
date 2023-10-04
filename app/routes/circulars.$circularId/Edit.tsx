import { useFetcher } from '@remix-run/react'
import {
  Button,
  ButtonGroup,
  Icon,
  Label,
  TextInput,
} from '@trussworks/react-uswds'
import { useRef } from 'react'

import Spinner from '~/components/Spinner'

export function Edit({
  circularId,
  eventId,
  synonyms,
}: {
  circularId: number
  eventId?: string
  synonyms?: string[]
}) {
  const fetcher = useFetcher()
  const formRef = useRef<HTMLFormElement>(null)
  return (
    <>
      <fetcher.Form method="POST" ref={formRef}>
        <input type="hidden" name="circular-id" value={circularId} />
        <Label htmlFor="event-id">Event Id:</Label>
        <TextInput
          data-focus
          name="event-id"
          id="event-id"
          type="text"
          defaultValue={eventId}
          placeholder={eventId || 'Event Id'}
        />
        <Label htmlFor="synonyms">
          Related Event Ids (comma separated values):
        </Label>
        <TextInput
          data-focus
          name="synonyms"
          id="synonyms"
          type="text"
          defaultValue={synonyms}
          placeholder={synonyms?.toString() || 'Synonyms'}
        />
        <ButtonGroup className="margin-top-2">
          <Button type="submit">Save</Button>
          {fetcher.state !== 'idle' && (
            <>
              <Spinner className="text-middle" /> Saving...
            </>
          )}
          {fetcher.state === 'idle' && fetcher.data === null && (
            <>
              <Icon.Check className="text-middle" color="green" /> Saved
            </>
          )}
        </ButtonGroup>
      </fetcher.Form>
    </>
  )
}
