/*
 * Cognito user pool ID for generated client credentials.
 *
 * Note that his is safe to include in public code because it is public
 * knowledge anyway: the Cognito user pool ID is easily deduced from the OpenID
 * token endpoint URL, which is public knowledge because it is part of the
 * client configuration for end users.
 *
 * FIXME: this should be parameterized for dev, test, and prod deployments,
 * all of which will eventually have independent OIDC providers.
 */
const cognitoUserPoolId = 'us-east-1_KCtbSlt63'

// Grant the Lambda function access to Cognito to run the credential vending machine.
module.exports = function lambdaCognitoPermissions(arc, sam) {
  const [region] = cognitoUserPoolId.split('_')
  sam.Resources.Role.Properties.Policies.push({
    PolicyName: 'ArcCognitoIdpPolicy',
    PolicyDocument: {
      Statement: [
        {
          Effect: 'Allow',
          Action: [
            'cognito-idp:CreateUserPoolClient',
            'cognito-idp:DeleteUserPoolClient',
          ],
          Resource: {
            'Fn::Sub': `arn:aws:cognito-idp:${region}:\${AWS::AccountId}:userpool/${cognitoUserPoolId}`,
          },
        },
      ],
    },
  })
  return sam
}
