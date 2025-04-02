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
const additionalEventId = 'GRB 424242A'
const previousSynonymId = crypto.randomUUID()
const previousInitialDate = 1693161309200
const existingEventSlug = existingEventId.replace(' ', '-').toLowerCase()
const eventSlug = eventId.replace(' ', '-').toLowerCase()
const additionalEventSlug = additionalEventId.replace(' ', '-').toLowerCase()
const initialDatePlaceholder = 1693161309269

const putData = {
  index: 'synonym-groups',
  id: synonymId,
  body: {
    synonymId,
    slugs: [] as string[],
    eventIds: [] as string[],
    initialDate: initialDatePlaceholder,
  },
}

const deleteData = {
  index: 'synonym-groups',
  id: previousSynonymId,
}

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
          initialDate: {
            S: initialDatePlaceholder.toString(),
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
          initialDate: {
            S: initialDatePlaceholder.toString(),
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

const mockStreamEventWithOldRecord = {
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
          initialDate: {
            S: initialDatePlaceholder.toString(),
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
          initialDate: {
            S: initialDatePlaceholder.toString(),
          },
        },
        OldImage: {
          synonymId: {
            S: previousSynonymId,
          },
          eventId: {
            S: eventId,
          },
          slug: {
            S: eventSlug,
          },
          initialDate: {
            S: initialDatePlaceholder.toString(),
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

// Github-slugger is mocked to prevent jest failing to properly load the package. If Jest attempts
// to load it, it will encounter a syntax error. Since all places where a slug would be created have been mocked,
// it doesn't need to return anything.
jest.mock('github-slugger', () => ({
  slug: jest.fn(),
}))

jest.mock('@nasa-gcn/architect-functions-search', () => ({
  search: jest.fn(),
}))

jest.mock('@architect/functions', () => ({
  tables: jest.fn(),
}))

const mockIndex = jest.fn()
const mockDelete = jest.fn()
const mockQuery = jest.fn()

afterEach(() => {
  jest.clearAllMocks()
})

describe('testing synonymGroup table-stream', () => {
  test('insert initial synonym record where no previous opensearch record exists', async () => {
    putData.id = synonymId
    putData.body.synonymId = synonymId
    putData.body.eventIds = [eventId]
    putData.body.slugs = [eventSlug]
    putData.body.initialDate = initialDatePlaceholder

    mockQuery.mockResolvedValue({
      Items: [
        {
          synonymId,
          eventId,
          slug: eventSlug,
          initialDate: initialDatePlaceholder,
        },
      ],
    })

    const mockClient = {
      synonyms: {
        query: mockQuery,
      },
    }

    ;(tables as unknown as jest.Mock).mockResolvedValue(mockClient)
    ;(search as unknown as jest.Mock).mockReturnValue({
      index: mockIndex,
      delete: mockDelete,
    })

    await handler(mockStreamEvent)

    expect(mockIndex).toHaveBeenCalledWith(putData)
    expect(mockIndex).toHaveBeenCalledTimes(1)
    expect(mockDelete).not.toHaveBeenCalled()
    expect(mockQuery).toHaveBeenCalledTimes(1)
  })

  test('insert into existing synonym group with removal of previous now unused group', async () => {
    putData.id = synonymId
    putData.body.synonymId = synonymId
    putData.body.eventIds = [existingEventId, eventId]
    putData.body.slugs = [existingEventSlug, eventSlug]
    putData.body.initialDate = initialDatePlaceholder

    const mockItems = [
      {
        synonymId,
        eventId: existingEventId,
        slug: existingEventSlug,
        initialDate: initialDatePlaceholder,
      },
      {
        synonymId,
        eventId,
        slug: eventSlug,
        initialDate: initialDatePlaceholder,
      },
    ]

    const implementedMockQuery = mockQuery.mockImplementation((query) => {
      if (query.ExpressionAttributeValues[':synonymId'] == previousSynonymId) {
        return { Items: [] }
      } else {
        return { Items: mockItems }
      }
    })

    ;(search as unknown as jest.Mock).mockReturnValue({
      index: mockIndex,
      delete: mockDelete,
    })

    const mockClient = {
      synonyms: {
        query: implementedMockQuery,
      },
    }

    ;(tables as unknown as jest.Mock).mockResolvedValue(mockClient)

    await handler(mockStreamEventWithOldRecord)

    expect(mockQuery).toHaveBeenCalledTimes(2)
    // the new group opensearch record is updated
    expect(mockIndex).toHaveBeenCalledWith(putData)
    expect(mockIndex).toHaveBeenCalledTimes(1)
    // the old group opensearch record is deleted
    expect(mockDelete).toHaveBeenCalledWith(deleteData)
    expect(mockDelete).toHaveBeenCalledTimes(1)
  })

  test('insert into existing synonym group with removal from old group with remaining members', async () => {
    const mockItems = [
      {
        synonymId,
        eventId: existingEventId,
        slug: existingEventSlug,
        initialDate: initialDatePlaceholder,
      },
      {
        synonymId,
        eventId,
        slug: eventSlug,
        initialDate: initialDatePlaceholder,
      },
    ]

    const mockPreviousItems = [
      {
        synonymId: previousSynonymId,
        eventId: additionalEventId,
        slug: additionalEventSlug,
        initialDate: initialDatePlaceholder,
      },
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
    })

    const mockClient = {
      synonyms: {
        query: implementedMockQuery,
      },
    }

    ;(tables as unknown as jest.Mock).mockResolvedValue(mockClient)

    await handler(mockStreamEventWithOldRecord)

    expect(mockQuery).toHaveBeenCalledTimes(2)
    putData.id = synonymId
    putData.body.synonymId = synonymId
    putData.body.eventIds = [existingEventId, eventId]
    putData.body.slugs = [existingEventSlug, eventSlug]
    putData.body.initialDate = initialDatePlaceholder
    expect(mockIndex).toHaveBeenCalledWith(putData)
    putData.id = previousSynonymId
    putData.body.synonymId = previousSynonymId
    putData.body.eventIds = [additionalEventId]
    putData.body.slugs = [additionalEventSlug]
    putData.body.initialDate = initialDatePlaceholder
    expect(mockIndex).toHaveBeenCalledWith(putData)
    expect(mockIndex).toHaveBeenCalledTimes(2)
    expect(mockDelete).not.toHaveBeenCalled()
  })

  test('insert into new synonym group with removal from old group with remaining members', async () => {
    const mockItems = [
      {
        synonymId,
        eventId,
        slug: eventSlug,
        initialDate: initialDatePlaceholder,
      },
    ]

    const mockPreviousItems = [
      {
        synonymId: previousSynonymId,
        eventId: additionalEventId,
        slug: additionalEventSlug,
        initialDate: initialDatePlaceholder,
      },
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
    })

    const mockClient = {
      synonyms: {
        query: implementedMockQuery,
      },
    }

    ;(tables as unknown as jest.Mock).mockResolvedValue(mockClient)

    await handler(mockStreamEventWithOldRecord)

    expect(mockQuery).toHaveBeenCalledTimes(2)
    putData.id = synonymId
    putData.body.synonymId = synonymId
    putData.body.eventIds = [eventId]
    putData.body.slugs = [eventSlug]
    putData.body.initialDate = initialDatePlaceholder
    expect(mockIndex).toHaveBeenCalledWith(putData)
    putData.id = previousSynonymId
    putData.body.synonymId = previousSynonymId
    putData.body.eventIds = [additionalEventId]
    putData.body.slugs = [additionalEventSlug]
    putData.body.initialDate = initialDatePlaceholder
    expect(mockIndex).toHaveBeenCalledWith(putData)
    expect(mockIndex).toHaveBeenCalledTimes(2)
    expect(mockDelete).not.toHaveBeenCalled()
  })

  test('insert into new synonym group with removal of previous now unused group', async () => {
    putData.id = synonymId
    putData.body.synonymId = synonymId
    putData.body.eventIds = [eventId]
    putData.body.slugs = [eventSlug]
    putData.body.initialDate = initialDatePlaceholder

    const mockItems = [
      {
        synonymId,
        eventId,
        slug: eventSlug,
        initialDate: initialDatePlaceholder,
      },
    ]

    const implementedMockQuery = mockQuery.mockImplementation((query) => {
      if (query.ExpressionAttributeValues[':synonymId'] == previousSynonymId) {
        return { Items: [] }
      } else {
        return { Items: mockItems }
      }
    })

    ;(search as unknown as jest.Mock).mockReturnValue({
      index: mockIndex,
      delete: mockDelete,
    })

    const mockClient = {
      synonyms: {
        query: implementedMockQuery,
      },
    }

    ;(tables as unknown as jest.Mock).mockResolvedValue(mockClient)

    await handler(mockStreamEventWithOldRecord)

    expect(mockQuery).toHaveBeenCalledTimes(2)
    // the new group opensearch record is updated
    expect(mockIndex).toHaveBeenCalledWith(putData)
    expect(mockIndex).toHaveBeenCalledTimes(1)
    // the old group opensearch record is deleted
    expect(mockDelete).toHaveBeenCalledWith(deleteData)
    expect(mockDelete).toHaveBeenCalledTimes(1)
  })
})

test('initialDate is updated on both the old and new group record', async () => {
  const mockItems = [
    {
      synonymId,
      eventId,
      slug: eventSlug,
      initialDate: initialDatePlaceholder,
    },
    {
      synonymId,
      eventId: 'event2',
      slug: 'event2',
      initialDate: previousInitialDate,
    },
  ]

  const mockPreviousItems = [
    {
      synonymId: previousSynonymId,
      eventId: additionalEventId,
      slug: additionalEventSlug,
      initialDate: initialDatePlaceholder,
    },
    {
      synonymId: previousSynonymId,
      eventId: 'event3',
      slug: 'event3',
      initialDate: previousInitialDate,
    },
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
  })

  const mockClient = {
    synonyms: {
      query: implementedMockQuery,
    },
  }

  ;(tables as unknown as jest.Mock).mockResolvedValue(mockClient)

  await handler(mockStreamEventWithOldRecord)

  expect(mockQuery).toHaveBeenCalledTimes(2)
  putData.id = synonymId
  putData.body.synonymId = synonymId
  putData.body.eventIds = [eventId, 'event2']
  putData.body.slugs = [eventSlug, 'event2']
  putData.body.initialDate = previousInitialDate
  expect(mockIndex).toHaveBeenCalledWith(putData)
  putData.id = previousSynonymId
  putData.body.synonymId = previousSynonymId
  putData.body.eventIds = [additionalEventId, 'event3']
  putData.body.slugs = [additionalEventSlug, 'event3']
  putData.body.initialDate = previousInitialDate
  expect(mockIndex).toHaveBeenCalledWith(putData)
  expect(mockIndex).toHaveBeenCalledTimes(2)
  expect(mockDelete).not.toHaveBeenCalled()
})
