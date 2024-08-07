/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import type { AttributeValue as LambdaTriggerAttributeValue } from 'aws-lambda'

export function unmarshallTrigger(
  item?: Record<string, LambdaTriggerAttributeValue>
) {
  return unmarshall(item as Record<string, AttributeValue>)
}
