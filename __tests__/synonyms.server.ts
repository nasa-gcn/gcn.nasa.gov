/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import type { AWSError, DynamoDB } from 'aws-sdk'
import * as awsSDKMock from 'aws-sdk-mock'
import crypto from 'crypto'

import type { Circular } from '~/routes/circulars/circulars.lib'
import {
  deleteSynonyms,
  getOldestDate,
  moderatorCreateSynonyms,
  putSynonyms,
} from '~/routes/synonyms/synonyms.server'

jest.mock('@architect/functions')

// Github-slugger is mocked to prevent jest failing to properly load the package. If Jest attempts
// to load it, it will encounter a syntax error. Since these eventIds do not have any characters that
// would be changed by the slugger, ensuring they are all lowercase is enough to mock the behavior
// of github-slugger in this case.
jest.mock('github-slugger', () => ({
  slug: (eventId: string) => {
    return eventId.toLowerCase()
  },
}))

const synonymId = 'abcde-abcde-abcde-abcde-abcde'
const altSynonymId1 = 'zyxw-zyxw-zyxw-zyxw-zyxw'
const altSynonymId2 = 'lmno-lmno-lmno-lmno-lmno'
const exampleCirculars = [
  {
    Items: [
      {
        circularId: 1234556,
        subject: 'subject 1',
        body: 'very intelligent things',
        eventId: 'eventId1',
        createdOn: 12345567,
        submitter: 'steve',
      } as Circular,
    ],
  },
  {
    Items: [
      {
        circularId: 1230000,
        subject: 'subject 2',
        body: 'more intelligent things',
        eventId: 'eventId2',
        createdOn: 12345560,
        submitter: 'steve',
      } as Circular,
    ],
  },
  {
    Items: [
      {
        circularId: 1234556,
        subject: 'subject 3',
        body: 'more space things',
        eventId: 'eventId3',
        createdOn: 12345542,
        submitter: 'steve',
      } as Circular,
    ],
  },
  {
    Items: [
      {
        circularId: 1230000,
        subject: 'subject 4',
        body: 'observations',
        eventId: 'eventId4',
        createdOn: 12345000,
        submitter: 'steve',
      } as Circular,
    ],
  },
]

describe('moderatorCreateSynonyms', () => {
  const mockBatchWrite = jest.fn()
  beforeEach(() => {
    const mockQuery = jest.fn()

    const mockClient = {
      batchWrite: mockBatchWrite,
      query: mockQuery,
    }

    ;(tables as unknown as jest.Mock).mockReturnValue({
      _doc: mockClient,
      name: () => {
        return 'synonyms'
      },
      circulars: {
        query: mockQuery
          .mockReturnValueOnce(exampleCirculars[1])
          .mockReturnValueOnce(exampleCirculars[0]),
      },
    })

    jest.spyOn(crypto, 'randomUUID').mockReturnValue(synonymId)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('moderatorCreateSynonyms should write to DynamoDB', async () => {
    const mockBatchWriteItem = jest.fn(
      (
        params: DynamoDB.DocumentClient.BatchWriteItemInput,
        callback: (
          err: AWSError | null,
          data?: DynamoDB.DocumentClient.BatchWriteItemOutput
        ) => void
      ) => {
        expect(params.RequestItems.synonyms).toBeDefined()
        callback(null, {})
      }
    )
    awsSDKMock.mock('DynamoDB', 'batchWriteItem', mockBatchWriteItem)

    const synonymousEventIds = ['eventId1', 'eventId2']
    const result = await moderatorCreateSynonyms(synonymousEventIds)

    expect(result).toBe(synonymId)
    expect(mockBatchWrite).toHaveBeenCalledWith({
      RequestItems: {
        synonyms: [
          {
            PutRequest: {
              Item: {
                eventId: 'eventId1',
                initialDate: 12345560,
                slug: 'eventid1',
                synonymId,
              },
            },
          },
          {
            PutRequest: {
              Item: {
                eventId: 'eventId2',
                initialDate: 12345567,
                slug: 'eventid2',
                synonymId,
              },
            },
          },
        ],
      },
    })
  })
})

describe('putSynonyms', () => {
  const mockBatchWrite = jest.fn()
  const mockQuery = jest.fn()

  afterAll(() => {
    jest.restoreAllMocks()
    awsSDKMock.restore('DynamoDB')
  })
  test('putSynonyms should not write to DynamoDB if no additions or subtractions', async () => {
    const mockClient = {
      batchWrite: mockBatchWrite,
    }
    ;(tables as unknown as jest.Mock).mockResolvedValue({
      _doc: mockClient,
      name: () => {
        return 'synonyms'
      },
    })
    awsSDKMock.mock('DynamoDB.DocumentClient', 'batchWrite', mockBatchWrite)

    await putSynonyms({ synonymId })

    expect(mockBatchWrite).not.toHaveBeenCalled()
  })

  test('putSynonyms should write to DynamoDB if there are additions', async () => {
    jest.spyOn(crypto, 'randomUUID').mockReturnValue(synonymId)
    const mockClient = {
      batchWrite: mockBatchWrite,
      query: mockQuery,
    }

    ;(tables as unknown as jest.Mock).mockReturnValue({
      _doc: mockClient,
      name: () => {
        return 'synonyms'
      },
      circulars: {
        query: mockQuery
          .mockReturnValueOnce(exampleCirculars[0])
          .mockReturnValueOnce(exampleCirculars[1]),
      },
    })
    awsSDKMock.mock('DynamoDB.DocumentClient', 'batchWrite', mockBatchWrite)
    const additions = ['eventId1', 'eventId2']
    await putSynonyms({ synonymId, additions })
    const params = {
      RequestItems: {
        synonyms: [
          {
            PutRequest: {
              Item: {
                eventId: 'eventId1',
                slug: 'eventid1',
                synonymId,
                initialDate: 12345567,
              },
            },
          },
          {
            PutRequest: {
              Item: {
                eventId: 'eventId2',
                slug: 'eventid2',
                synonymId,
                initialDate: 12345560,
              },
            },
          },
        ],
      },
    }
    expect(mockBatchWrite).toHaveBeenLastCalledWith(params)
  })

  test('putSynonyms should write to DynamoDB if there are subtractions', async () => {
    jest
      .spyOn(crypto, 'randomUUID')
      .mockImplementationOnce(() => altSynonymId1)
      .mockImplementationOnce(() => altSynonymId2)
    const mockClient = {
      batchWrite: mockBatchWrite,
    }
    ;(tables as unknown as jest.Mock).mockResolvedValue({
      _doc: mockClient,
      name: () => {
        return 'synonyms'
      },
      circulars: {
        query: mockQuery
          .mockReturnValueOnce(exampleCirculars[2])
          .mockReturnValueOnce(exampleCirculars[3]),
      },
    })
    awsSDKMock.mock('DynamoDB.DocumentClient', 'batchWrite', mockBatchWrite)

    const subtractions = ['eventId3', 'eventId4']

    await putSynonyms({ synonymId, subtractions })
    const params = {
      RequestItems: {
        synonyms: [
          {
            PutRequest: {
              Item: {
                eventId: 'eventId3',
                slug: 'eventid3',
                synonymId: altSynonymId1,
                initialDate: 12345542,
              },
            },
          },
          {
            PutRequest: {
              Item: {
                eventId: 'eventId4',
                slug: 'eventid4',
                synonymId: altSynonymId2,
                initialDate: 12345000,
              },
            },
          },
        ],
      },
    }
    expect(mockBatchWrite).toHaveBeenLastCalledWith(params)
  })

  test('putSynonyms should write to DynamoDB if there are additions and subtractions', async () => {
    jest
      .spyOn(crypto, 'randomUUID')
      .mockImplementationOnce(() => altSynonymId1)
      .mockImplementationOnce(() => altSynonymId2)
    const mockClient = {
      batchWrite: mockBatchWrite,
      query: mockQuery,
    }

    ;(tables as unknown as jest.Mock).mockReturnValue({
      _doc: mockClient,
      name: () => {
        return 'synonyms'
      },
      circulars: {
        query: mockQuery
          .mockReturnValueOnce(exampleCirculars[0])
          .mockReturnValueOnce(exampleCirculars[1])
          .mockReturnValueOnce(exampleCirculars[2])
          .mockReturnValueOnce(exampleCirculars[3]),
      },
    })
    awsSDKMock.mock('DynamoDB.DocumentClient', 'batchWrite', mockBatchWrite)

    const additions = ['eventId1', 'eventId2']
    const subtractions = ['eventId3', 'eventId4']

    await putSynonyms({ synonymId, additions, subtractions })

    const params = {
      RequestItems: {
        synonyms: [
          {
            PutRequest: {
              Item: {
                eventId: 'eventId3',
                slug: 'eventid3',
                synonymId: altSynonymId1,
                initialDate: 12345567,
              },
            },
          },
          {
            PutRequest: {
              Item: {
                eventId: 'eventId4',
                slug: 'eventid4',
                synonymId: altSynonymId2,
                initialDate: 12345560,
              },
            },
          },
          {
            PutRequest: {
              Item: {
                eventId: 'eventId1',
                slug: 'eventid1',
                synonymId,
                initialDate: 12345542,
              },
            },
          },
          {
            PutRequest: {
              Item: {
                eventId: 'eventId2',
                slug: 'eventid2',
                synonymId,
                initialDate: 12345000,
              },
            },
          },
        ],
      },
    }
    expect(mockBatchWrite).toHaveBeenLastCalledWith(params)
  })
})

describe('getOldestDate', () => {
  afterAll(() => {
    jest.restoreAllMocks()
  })
  test('oldest date of circular should be selected', async () => {
    const groupOfCirculars = {
      Items: [
        {
          circularId: 1234556,
          subject: 'subject 1',
          body: 'very intelligent things',
          eventId: 'eventId1',
          createdOn: 1691210429787,
          submitter: 'steve',
        } as Circular,
        {
          circularId: 1230000,
          subject: 'subject 2',
          body: 'more intelligent things',
          eventId: 'eventId1',
          createdOn: 1691026667050,
          submitter: 'steve',
        } as Circular,
        {
          circularId: 1234556,
          subject: 'subject 3',
          body: 'even more intelligent things',
          eventId: 'eventId1',
          createdOn: 1691220413132,
          submitter: 'steve',
        } as Circular,
      ],
    }

    const mockQuery = jest.fn().mockReturnValue(groupOfCirculars)
    const mockClient = {
      query: mockQuery,
    }
    ;(tables as unknown as jest.Mock).mockResolvedValue({
      _doc: mockClient,
      name: () => {
        return 'synonyms'
      },
      circulars: {
        query: mockQuery.mockReturnValue(groupOfCirculars),
      },
    })
    const results = await getOldestDate('eventId1')
    expect(results).toEqual(1691026667050)
  })
})

describe('deleteSynonyms', () => {
  const mockBatchWrite = jest.fn()
  const mockQuery = jest.fn()

  afterEach(() => {
    jest.restoreAllMocks()
    awsSDKMock.restore('DynamoDB')
  })
  test('deleteSynonyms should write to DynamoDB with new synonymIds', async () => {
    jest.spyOn(crypto, 'randomUUID').mockReturnValue(synonymId)
    const mockClient = {
      batchWrite: mockBatchWrite,
      query: mockQuery,
    }
    const altSynonymId1 = 'altone-abcde-abcde-abcde-abcde'
    const altSynonymId2 = 'alttwo-abcde-abcde-abcde-abcde'
    jest
      .spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce(altSynonymId1)
      .mockReturnValueOnce(altSynonymId2)
    const mockSynonymQueryResults = {
      Items: [
        {
          synonymId,
          eventId: 'eventId1',
          initialDate: 12345000,
        },
        {
          synonymId,
          eventId: 'eventId2',
          initialDate: 12345001,
        },
      ],
    }

    ;(tables as unknown as jest.Mock).mockReturnValue({
      _doc: mockClient,
      name: () => {
        return 'synonyms'
      },
      synonyms: {
        query: mockQuery.mockReturnValueOnce(mockSynonymQueryResults),
      },
      circulars: {
        query: mockQuery
          .mockReturnValueOnce(exampleCirculars[0])
          .mockReturnValueOnce(exampleCirculars[1]),
      },
    })
    awsSDKMock.mock('DynamoDB.DocumentClient', 'batchWrite', mockBatchWrite)
    await deleteSynonyms(synonymId)
    const params = {
      RequestItems: {
        synonyms: [
          {
            PutRequest: {
              Item: {
                eventId: 'eventId1',
                slug: 'eventid1',
                synonymId: altSynonymId1,
                initialDate: 12345567,
              },
            },
          },
          {
            PutRequest: {
              Item: {
                eventId: 'eventId2',
                slug: 'eventid2',
                synonymId: altSynonymId2,
                initialDate: 12345560,
              },
            },
          },
        ],
      },
    }
    expect(mockBatchWrite).toHaveBeenLastCalledWith(params)
  })
})
