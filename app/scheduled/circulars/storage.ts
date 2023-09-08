/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { S3Client } from '@aws-sdk/client-s3'

export const s3 = new S3Client({})
export const keyPrefix = 'generated/circulars'
