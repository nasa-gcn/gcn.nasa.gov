/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export const deploy = {
  start({ cloudformation }) {
    cloudformation.Resources.GcnCircularsProducerUserPoolClient = {
      Type: 'AWS::Cognito::UserPoolClient',
      Properties: {
        AllowedOAuthFlows: ['client_credentials'],
        AllowedOAuthFlowsUserPoolClient: true,
        AllowedOAuthScopes: ['gcn.nasa.gov/kafka-circulars-producer'],
        GenerateSecret: true,
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
      },
    }
  },
}
