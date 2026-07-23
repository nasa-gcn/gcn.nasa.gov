/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export const deploy = {
  start({ cloudformation, arc: { appclients } }) {
    appclients.forEach((item) => {
      const [
        [
          {
            clientKey,
            envResourceName,
            scope,
            envClientIdName,
            envClientSecretName,
          },
        ],
      ] = Object.entries(item)
      const env =
        cloudformation.Resources[envResourceName].Properties.Environment
          .Variables
      const user_pool_id = env.COGNITO_USER_POOL_ID
      if (!user_pool_id)
        throw new Error('Environment variable COGNITO_USER_POOL_ID must be set')
      cloudformation.Resources[`AppClient${clientKey}`] = {
        Type: 'AWS::Cognito::UserPoolClient',
        Properties: {
          AllowedOAuthFlows: ['client_credentials'],
          AllowedOAuthFlowsUserPoolClient: true,
          AllowedOAuthScopes: [scope],
          GenerateSecret: true,
          UserPoolId: user_pool_id,
        },
      }
      // FIXME: alt method using services in code would be preferred, but
      // top level awaits aren't supported and would require further updates.
      // This should be updated to use services
      env[envClientIdName] = {
        'Fn::GetAtt': `${clientKey}.ClientId`,
      }
      env[envClientSecretName] = {
        'Fn::GetAtt': `${clientKey}.ClientSecret`,
      }
    })
  },
}
