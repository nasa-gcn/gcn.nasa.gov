/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export const deploy = {
  start({ cloudformation }) {
    const clientKey = 'GcnCircularsProducerUserPoolClient'
    const env =
      cloudformation.Resources.CircularsTableStreamLambda.Properties.Environment
        .Variables
    const user_pool_id = env.COGNITO_USER_POOL_ID
    if (!user_pool_id)
      throw new Error('Environment variable COGNITO_USER_POOL_ID must be set')
    cloudformation.Resources[clientKey] = {
      Type: 'AWS::Cognito::UserPoolClient',
      Properties: {
        AllowedOAuthFlows: ['client_credentials'],
        AllowedOAuthFlowsUserPoolClient: true,
        AllowedOAuthScopes: ['gcn.nasa.gov/kafka-circulars-producer'],
        GenerateSecret: true,
        UserPoolId: user_pool_id,
      },
    }
    env.KAFKA_CLIENT_ID = {
      'Fn::GetAtt': `${clientKey}.ClientId`,
    }
    env.KAFKA_CLIENT_SECRET = {
      'Fn::GetAtt': `${clientKey}.ClientSecret`,
    }
  },
}
