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
      const [[key, { scope }]] = Object.entries(item)
      const UserPoolId = process.env.COGNITO_USER_POOL_ID
      if (!UserPoolId)
        throw new Error('Environment variable COGNITO_USER_POOL_ID must be set')
      cloudformation.Resources[`AppClient${key}`] = {
        Type: 'AWS::Cognito::UserPoolClient',
        Properties: {
          AllowedOAuthFlows: ['client_credentials'],
          AllowedOAuthFlowsUserPoolClient: true,
          AllowedOAuthScopes: [scope],
          GenerateSecret: true,
          UserPoolId,
        },
      }
    })
  },
  services({ cloudformation, arc: { appclients }, stage }) {
    let result = {}
    const isLocal = stage === 'testing'
    appclients.forEach((item) => {
      const [[key]] = Object.entries(item)
      result = {
        ...result,
        [`${key}-clientId`]: isLocal
          ? 'localClientId'
          : {
              'Fn::GetAtt': `${key}.ClientId`,
            },
        [`${key}-clientSecret`]: isLocal
          ? 'localClientSecret'
          : {
              'Fn::GetAtt': `${key}.ClientSecret`,
            },
      }
    })
    return result
  },
}
