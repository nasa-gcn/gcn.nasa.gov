import { tables } from '@architect/functions'
import type { AWSError, DynamoDB } from 'aws-sdk'
import * as awsSDKMock from 'aws-sdk-mock'
import crypto from 'crypto'

import { createSynonyms, putSynonyms } from '~/routes/synonyms/synonyms.server'

jest.mock('@architect/functions')

describe('createSynonyms', () => {
  beforeAll(() => {
    const mockBatchWrite = jest.fn()
    const mockClient = {
      batchWrite: mockBatchWrite,
    }
    ;(tables as unknown as jest.Mock).mockResolvedValue({
      _doc: mockClient,
      name: () => {
        return 'synonyms'
      },
    })

    jest
      .spyOn(crypto, 'randomUUID')
      .mockReturnValue('abcde-abcde-abcde-abcde-abcde')
  })

  afterAll(() => {
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

    expect(result).toBe('abcde-abcde-abcde-abcde-abcde')
  })
})

describe('putSynonyms', () => {
  const mockBatchWrite = jest.fn()
  beforeAll(() => {
    const mockClient = {
      batchWrite: mockBatchWrite,
    }
    ;(tables as unknown as jest.Mock).mockResolvedValue({
      _doc: mockClient,
      name: () => {
        return 'synonyms'
      },
    })

    jest
      .spyOn(crypto, 'randomUUID')
      .mockReturnValue('abcde-abcde-abcde-abcde-abcde')
  })

  afterAll(() => {
    jest.restoreAllMocks()
    awsSDKMock.restore('DynamoDB')
  })
  test('putSynonyms should not write to DynamoDB if no additions or subtractions', async () => {
    awsSDKMock.mock('DynamoDB.DocumentClient', 'batchWrite', mockBatchWrite)

    const uuid = 'abcde-abcde-abcde-abcde-abcde'

    await putSynonyms({ uuid })

    expect(mockBatchWrite).not.toHaveBeenCalled()
  })

  test('putSynonyms should write to DynamoDB if there are additions', async () => {
    awsSDKMock.mock('DynamoDB.DocumentClient', 'batchWrite', mockBatchWrite)

    const uuid = 'abcde-abcde-abcde-abcde-abcde'
    const additions = ['eventId1', 'eventId2']
    await putSynonyms({ uuid, additions })
    const params = {
      RequestItems: {
        synonyms: [
          [
            {
              PutRequest: {
                Item: {
                  eventId: 'eventId1',
                  uuid: 'abcde-abcde-abcde-abcde-abcde',
                },
              },
            },
            {
              PutRequest: {
                Item: {
                  eventId: 'eventId2',
                  uuid: 'abcde-abcde-abcde-abcde-abcde',
                },
              },
            },
          ],
        ],
      },
    }
    expect(mockBatchWrite).toHaveBeenLastCalledWith(params)
  })

  test('putSynonyms should write to DynamoDB if there are subtractions', async () => {
    awsSDKMock.mock('DynamoDB.DocumentClient', 'batchWrite', mockBatchWrite)

    const uuid = 'abcde-abcde-abcde-abcde-abcde'
    const subtractions = ['eventId3', 'eventId4']

    await putSynonyms({ uuid, subtractions })
    const params = {
      RequestItems: {
        synonyms: [
          [
            {
              DeleteRequest: {
                Key: {
                  eventId: 'eventId3',
                  uuid: 'abcde-abcde-abcde-abcde-abcde',
                },
              },
            },
            {
              DeleteRequest: {
                Key: {
                  eventId: 'eventId4',
                  uuid: 'abcde-abcde-abcde-abcde-abcde',
                },
              },
            },
          ],
        ],
      },
    }
    expect(mockBatchWrite).toHaveBeenLastCalledWith(params)
  })

  test('putSynonyms should write to DynamoDB if there are additions and subtractions', async () => {
    awsSDKMock.mock('DynamoDB.DocumentClient', 'batchWrite', mockBatchWrite)

    const uuid = 'abcde-abcde-abcde-abcde-abcde'
    const additions = ['eventId1', 'eventId2']
    const subtractions = ['eventId3', 'eventId4']

    await putSynonyms({ uuid, additions, subtractions })

    const params = {
      RequestItems: {
        synonyms: [
          [
            {
              DeleteRequest: {
                Key: {
                  eventId: 'eventId3',
                  uuid: 'abcde-abcde-abcde-abcde-abcde',
                },
              },
            },
            {
              DeleteRequest: {
                Key: {
                  eventId: 'eventId4',
                  uuid: 'abcde-abcde-abcde-abcde-abcde',
                },
              },
            },
          ],
          [
            {
              PutRequest: {
                Item: {
                  eventId: 'eventId1',
                  uuid: 'abcde-abcde-abcde-abcde-abcde',
                },
              },
            },
            {
              PutRequest: {
                Item: {
                  eventId: 'eventId2',
                  uuid: 'abcde-abcde-abcde-abcde-abcde',
                },
              },
            },
          ],
        ],
      },
    }
    expect(mockBatchWrite).toHaveBeenLastCalledWith(params)
  })
})
