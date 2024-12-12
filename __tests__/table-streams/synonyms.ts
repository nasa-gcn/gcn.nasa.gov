/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import { search } from '@nasa-gcn/architect-functions-search'
import type { DynamoDBRecord } from 'aws-lambda'
import crypto from 'crypto'

import { handler } from '~/table-streams/synonyms/index'

const synonymId = crypto.randomUUID()
const eventId = 'GRB 123'
const existingEventId = 'GRB 99999999'
const previousSynonymId = crypto.randomUUID()

const putData = {
  index: 'synonym-groups',
  id: synonymId,
  body: {
    synonymId,
    slugs: [] as string[],
    eventIds: [] as string[],
  },
}

jest.mock('@nasa-gcn/architect-functions-search', () => ({
  search: jest.fn(),
}))

// Github-slugger is mocked to prevent jest failing to properly load the package. If Jest attempts
// to load it, it will encounter a syntax error. Since these eventIds do not have any characters that
// would be changed by the slugger, ensuring they are all lowercase is enough to mock the behavior
// of github-slugger in this case.
jest.mock('github-slugger', () => ({
  slug: (eventId: string) => {
    return eventId.toLowerCase()
  },
}))

jest.mock('@architect/functions', () => ({
  tables: jest.fn(),
}))

const mockIndex = jest.fn()
const mockDelete = jest.fn()
const mockQuery = jest.fn()

const eventSlug = eventId.replace(' ', '-').toLowerCase()
const mockStreamEvent = {
  Records: [
    {
      eventID: '1',
      eventName: 'INSERT',
      eventVersion: '1.0',
      eventSource: 'aws:dynamodb',
      awsRegion: 'us-west-2',
      dynamodb: {
        Keys: {
          synonymId: {
            S: synonymId,
          },
          eventId: {
            S: eventId,
          },
          slug: {
            S: eventSlug,
          },
        },
        NewImage: {
          synonymId: {
            S: synonymId,
          },
          eventId: {
            S: eventId,
          },
          slug: {
            S: eventSlug,
          },
        },
        SequenceNumber: '111',
        SizeBytes: 26,
        StreamViewType: 'NEW_IMAGE',
      },
      eventSourceARN:
        'arn:aws:dynamodb:us-west-2:123456789012:table/synonym-groups/stream/2020-01-01T00:00:00.000',
    } as DynamoDBRecord,
  ],
}

afterEach(() => {
  jest.clearAllMocks()
})

describe('testing put synonymGroup table-stream', () => {
  test('insert initial synonym record where no existing opensearch record exists', async () => {
    const mockSearch = jest
      .fn()
      .mockReturnValue({ body: { hits: { hits: [] } } })
    const slug = eventId.replace(' ', '-').toLowerCase()
    const mockItems = [{ synonymId, eventId, slug }]
    const mockClient = {
      synonyms: {
        query: mockQuery,
      },
    }
    mockQuery.mockResolvedValue({ Items: mockItems })
    ;(tables as unknown as jest.Mock).mockResolvedValue(mockClient)
    putData.body.eventIds = [eventId]
    ;(search as unknown as jest.Mock).mockReturnValue({
      index: mockIndex,
      delete: mockDelete,
      search: mockSearch,
    })

    await handler(mockStreamEvent)
    putData.body.slugs.push(slug)
    expect(mockIndex).toHaveBeenCalledWith(putData)
  })

  test('insert into existing synonym group with removal of now unused group', async () => {
    const existingEventSlug = existingEventId.replace(' ', '-').toLowerCase()
    const deleteData = {
      index: 'synonym-groups',
      id: previousSynonymId,
    }

    const mockSearch = jest.fn().mockReturnValue({
      body: {
        hits: {
          hits: [
            {
              _source: {
                synonymId: previousSynonymId,
                eventIds: [eventId],
                slugs: [eventSlug],
              },
            },
          ],
        },
      },
    })

    const mockItems = [
      { synonymId, eventId: existingEventId, slug: existingEventSlug },
      { synonymId, eventId, slug: eventSlug },
    ]

    const mockPreviousItems = [
      { synonymId: previousSynonymId, eventId, slug: eventSlug },
    ]

    const implementedMockQuery = mockQuery.mockImplementation((query) => {
      if (query.ExpressionAttributeValues[':synonymId'] == previousSynonymId) {
        return { Items: mockPreviousItems }
      } else {
        return { Items: mockItems }
      }
    })
    ;(search as unknown as jest.Mock).mockReturnValue({
      index: mockIndex,
      delete: mockDelete,
      search: mockSearch,
    })
    const mockClient = {
      synonyms: {
        query: implementedMockQuery,
      },
    }

    ;(tables as unknown as jest.Mock).mockResolvedValue(mockClient)
    putData.body.eventIds = [existingEventId, eventId]
    putData.body.slugs = [existingEventSlug, eventSlug]

    mockQuery.mockImplementation((query) => {
      if (query.ExpressionAttributeValues[':synonymId'] == previousSynonymId) {
        return { Items: mockPreviousItems }
      } else {
        return { Items: mockItems }
      }
    })
    await handler(mockStreamEvent)
    // the new group opensearch record is updated
    expect(mockIndex).toHaveBeenCalledWith(putData)
    // the old group opensearch record is deleted
    expect(mockDelete).toHaveBeenCalledWith(deleteData)
  })
})
