/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

// Enable AWS X-Ray distributed tracing.
// See https://aws-otel.github.io/docs/getting-started/lambda/lambda-js#enable-auto-instrumentation-for-your-lambda-function

export const deploy = {
  start({ cloudformation }) {
    const lambdaProps =
      cloudformation.Resources.AnyCatchallHTTPLambda.Properties
    const roleProps = cloudformation.Resources.Role.Properties

    lambdaProps.Tracing = 'Active'
    ;(lambdaProps.Layers ?? (lambdaProps.Layers = [])).push({
      'Fn::Sub':
        // eslint-disable-next-line no-template-curly-in-string
        'arn:aws:lambda:${AWS::Region}:901920570463:layer:aws-otel-nodejs-arm64-ver-1-8-0:2',
    })
    ;(roleProps.ManagedPolicyArns ?? (roleProps.ManagedPolicyArns = [])).push(
      'arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess'
    )

    Object.assign(lambdaProps.Environment.Variables, {
      AWS_LAMBDA_EXEC_WRAPPER: '/opt/otel-handler',
      NODE_OPTIONS: '--require /var/task/tracing.js',
      OPENTELEMETRY_COLLECTOR_CONFIG_FILE: '/var/task/collector.yaml',
    })

    return cloudformation
  },
}
