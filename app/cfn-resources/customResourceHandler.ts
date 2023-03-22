/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type {
  CloudFormationCustomResourceCreateEvent,
  CloudFormationCustomResourceDeleteEvent,
  CloudFormationCustomResourceEvent,
  CloudFormationCustomResourceHandler,
  CloudFormationCustomResourceResponse,
  CloudFormationCustomResourceUpdateEvent,
} from 'aws-lambda'

type MaybePromise<T> = T | Promise<T>

type Request<T extends CloudFormationCustomResourceEvent> = Omit<
  T,
  'ServiceToken' | 'ResponseURL' | 'RequestId' | 'RequestType'
>

type CreateRequest = Request<CloudFormationCustomResourceCreateEvent>
type UpdateRequest = Request<CloudFormationCustomResourceUpdateEvent>
type DeleteRequest = Request<CloudFormationCustomResourceDeleteEvent>

type Response = Pick<
  CloudFormationCustomResourceResponse,
  'PhysicalResourceId' | 'Data' | 'NoEcho'
>

type CreateFunction = (request: CreateRequest) => MaybePromise<Response>
type UpdateFunction = (request: UpdateRequest) => MaybePromise<Response>
type DeleteFunction = (request: DeleteRequest) => MaybePromise<void>

type CustomResourceHandlerProps = {
  Create: CreateFunction
  Delete: DeleteFunction
  Update: UpdateFunction
}

/**
 * Create an AWS Lambda handler to process custom CloudFormation resources.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-custom-resources-lambda.html
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/crpg-ref.html
 */
export function createCustomResourceHandler({
  Create,
  Update,
  Delete,
}: CustomResourceHandlerProps): CloudFormationCustomResourceHandler {
  return async (event) => {
    const {
      ServiceToken,
      ResponseURL,
      RequestId,
      RequestType,
      ...requestProps
    } = event
    const { StackId, LogicalResourceId } = requestProps
    let Status: CloudFormationCustomResourceResponse['Status']
    let Reason
    let responseProps

    try {
      switch (RequestType) {
        case 'Create':
          responseProps = await Create(requestProps as CreateRequest)
          break
        case 'Update':
          responseProps = await Update(requestProps as UpdateRequest)
          break
        case 'Delete':
          const { PhysicalResourceId } = event
          if (PhysicalResourceId !== `${StackId}-${LogicalResourceId}-FAILED`)
            await Delete(requestProps as DeleteRequest)
          responseProps = {
            PhysicalResourceId,
          }
          break
      }
      Status = Reason = 'SUCCESS'
    } catch (e) {
      console.error(e)
      responseProps = {
        PhysicalResourceId: `${StackId}-${LogicalResourceId}-FAILED`,
      }
      Status = 'FAILED'
      Reason = String(e)
    }

    const body: CloudFormationCustomResourceResponse = {
      LogicalResourceId,
      RequestId,
      StackId,
      Status,
      Reason,
      ...responseProps,
    }

    await fetch(ResponseURL, {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
    })
  }
}
