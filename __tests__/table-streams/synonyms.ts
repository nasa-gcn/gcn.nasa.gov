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

import type { Synonym } from '~/routes/synonyms/synonyms.lib'
import { handler } from '~/table-streams/synonyms/index'

const synonymId = 'abcde-abcde-abcde-abcde-abcde'
const eventId = 'GRB 123'
const existingEventId = 'GRB 99999999'

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
        },
        NewImage: {
          synonymId: {
            S: synonymId,
          },
          eventId: {
            S: eventId,
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
  test('insert new synonym group', async () => {
    const mockItems = [{ synonymId, eventId }]
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
    })

    await handler(mockStreamEvent)

    expect(mockIndex).toHaveBeenCalledWith(putData)
  })

  test('insert into existing synonym group', async () => {
    const mockItems = [
      { synonymId, eventId: existingEventId },
      { synonymId, eventId },
    ]
    const mockClient = {
      synonyms: {
        query: mockQuery,
      },
    }
    mockQuery.mockResolvedValue({ Items: mockItems })
    ;(tables as unknown as jest.Mock).mockResolvedValue(mockClient)
    putData.body.eventIds = [existingEventId, eventId]
    ;(search as unknown as jest.Mock).mockReturnValue({
      index: mockIndex,
      delete: mockDelete,
    })

    await handler(mockStreamEvent)

    expect(mockIndex).toHaveBeenCalledWith(putData)
  })

  test('insert only once', async () => {
    const mockItems = [
      { synonymId, eventId: existingEventId },
      { synonymId, eventId },
    ]
    const mockClient = {
      synonyms: {
        query: mockQuery,
      },
    }
    mockQuery.mockResolvedValue({ Items: mockItems })
    ;(tables as unknown as jest.Mock).mockResolvedValue(mockClient)
    putData.body.eventIds = [existingEventId, eventId]
    ;(search as unknown as jest.Mock).mockReturnValue({
      index: mockIndex,
      delete: mockDelete,
    })

    await handler(mockStreamEvent)

    expect(mockIndex).toHaveBeenCalledWith(putData)
  })
})

describe('testing delete synonymGroup table-stream', () => {
  test('remove one eventId while leaving others', async () => {
    const mockItems = [{ synonymId, eventId: existingEventId }]
    const mockClient = {
      synonyms: {
        query: mockQuery,
      },
    }
    mockQuery.mockResolvedValue({ Items: mockItems })
    ;(tables as unknown as jest.Mock).mockResolvedValue(mockClient)
    mockStreamEvent.Records[0].eventName = 'REMOVE'
    putData.body.eventIds = [existingEventId]
    ;(search as unknown as jest.Mock).mockReturnValue({
      index: mockIndex,
      delete: mockDelete,
    })

    await handler(mockStreamEvent)

    expect(mockIndex).toHaveBeenCalledWith(putData)
  })

  test('remove final synonym and delete synonym group', async () => {
    const mockItems = [] as Synonym[]
    const mockClient = {
      synonyms: {
        query: mockQuery,
      },
    }
    mockQuery.mockResolvedValue({ Items: mockItems })
    ;(tables as unknown as jest.Mock).mockResolvedValue(mockClient)
    mockStreamEvent.Records[0].eventName = 'REMOVE'
    const deleteData = {
      index: 'synonym-groups',
      id: synonymId,
    }
    ;(search as unknown as jest.Mock).mockReturnValue({
      index: mockIndex,
      delete: mockDelete,
    })

    await handler(mockStreamEvent)

    expect(mockDelete).toHaveBeenCalledWith(deleteData)
  })
})
