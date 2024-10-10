import { tables } from '@architect/functions'
import type { AWSError, DynamoDB } from 'aws-sdk'
import * as awsSDKMock from 'aws-sdk-mock'
import crypto from 'crypto'

import type { Circular } from '~/routes/circulars/circulars.lib'
import { createSynonyms, putSynonyms } from '~/routes/synonyms/synonyms.server'

jest.mock('@architect/functions')
const synonymId = 'abcde-abcde-abcde-abcde-abcde'
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
  { Items: [] },
]

describe('createSynonyms', () => {
  beforeEach(() => {
    const mockBatchWrite = jest.fn()
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
          .mockReturnValueOnce(exampleCirculars[0])
          .mockReturnValueOnce(exampleCirculars[1]),
      },
    })

    jest.spyOn(crypto, 'randomUUID').mockReturnValue(synonymId)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('createSynonyms should write to DynamoDB', async () => {
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
    const result = await createSynonyms(synonymousEventIds)

    expect(result).toBe(synonymId)
  })

  test('createSynonyms with nonexistent eventId throws Response 400', async () => {
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

    const synonymousEventIds = ['eventId1', 'nope']
    try {
      await createSynonyms(synonymousEventIds)
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toBeInstanceOf(Response)
      const convertedError = error as Response
      // eslint-disable-next-line jest/no-conditional-expect
      expect(convertedError.status).toBe(400)
      const errorMessage = await convertedError.text()
      // eslint-disable-next-line jest/no-conditional-expect
      expect(errorMessage).toBe('eventId does not exist')
    }
  })
})

describe('putSynonyms', () => {
  const mockBatchWrite = jest.fn()
  const mockQuery = jest.fn()

  beforeAll(() => {
    jest.spyOn(crypto, 'randomUUID').mockReturnValue(synonymId)
  })

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

  test('putSynonyms should throw 400 response if there are invalid additions', async () => {
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
        query: mockQuery.mockReturnValueOnce(exampleCirculars[2]),
      },
    })
    awsSDKMock.mock('DynamoDB.DocumentClient', 'batchWrite', mockBatchWrite)
    try {
      await putSynonyms({ synonymId, additions: ["doesn't exist"] })
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toBeInstanceOf(Response)
      const convertedError = error as Response
      // eslint-disable-next-line jest/no-conditional-expect
      expect(convertedError.status).toBe(400)
      const errorMessage = await convertedError.text()
      // eslint-disable-next-line jest/no-conditional-expect
      expect(errorMessage).toBe('eventId does not exist')
    }
  })

  test('putSynonyms should write to DynamoDB if there are additions', async () => {
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
                synonymId,
              },
            },
          },
          {
            PutRequest: {
              Item: {
                eventId: 'eventId2',
                synonymId,
              },
            },
          },
        ],
      },
    }
    expect(mockBatchWrite).toHaveBeenLastCalledWith(params)
  })

  test('putSynonyms should write to DynamoDB if there are subtractions', async () => {
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

    const subtractions = ['eventId3', 'eventId4']

    await putSynonyms({ synonymId, subtractions })
    const params = {
      RequestItems: {
        synonyms: [
          { DeleteRequest: { Key: { eventId: 'eventId3' } } },
          { DeleteRequest: { Key: { eventId: 'eventId4' } } },
        ],
      },
    }
    expect(mockBatchWrite).toHaveBeenLastCalledWith(params)
  })

  test('putSynonyms should write to DynamoDB if there are additions and subtractions', async () => {
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
    const subtractions = ['eventId3', 'eventId4']

    await putSynonyms({ synonymId, additions, subtractions })

    const params = {
      RequestItems: {
        synonyms: [
          {
            DeleteRequest: {
              Key: {
                eventId: 'eventId3',
              },
            },
          },
          {
            DeleteRequest: {
              Key: {
                eventId: 'eventId4',
              },
            },
          },
          {
            PutRequest: {
              Item: {
                eventId: 'eventId1',
                synonymId,
              },
            },
          },
          {
            PutRequest: {
              Item: {
                eventId: 'eventId2',
                synonymId,
              },
            },
          },
        ],
      },
    }
    expect(mockBatchWrite).toHaveBeenLastCalledWith(params)
  })
})
