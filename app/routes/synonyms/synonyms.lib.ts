/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/* Data structure in DynamoDB */
export interface Synonym {
  eventId: string
  synonymId: string
  slug: string
  initialDate: number
}

/* Layout of materialized view in OpenSearch */
export interface SynonymGroup {
  synonymId: string
  eventIds: string[]
  slugs: string[]
  initialDate: number
}
