/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

// Grant the Lambda function permission to send email.
module.exports.deploy = {
  start: ({ cloudformation }) => {
    cloudformation.Resources.Role.Properties.Policies.push({
      PolicyName: 'ArcSesPolicy',
      PolicyDocument: {
        Statement: [
          {
            Effect: 'Allow',
            Action: ['ses:SendEmail'],
            Resource: {
              'Fn::Sub': `arn:aws:ses:\${AWS::Region}:\${AWS::AccountId}:identity/*`,
            },
          },
        ],
      },
    })
    return cloudformation
  },
}
