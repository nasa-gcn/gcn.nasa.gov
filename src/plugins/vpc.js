/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  DescribeSubnetsCommand,
  DescribeVpcsCommand,
  EC2Client,
} from '@aws-sdk/client-ec2'

async function getVpcConfig() {
  const ec2 = new EC2Client()

  const { Vpcs } = await ec2.send(new DescribeVpcsCommand())
  const numVpcs = Vpcs?.length
  if (numVpcs !== 1) {
    throw new Error(
      `expected exactly one VPC in this account, but found ${numVpcs}`
    )
  }
  const VpcId = Vpcs[0].VpcId

  const { Subnets } = await ec2.send(
    new DescribeSubnetsCommand({
      Filters: [
        { Name: 'vpc-id', Values: [VpcId] },
        { Name: 'map-public-ip-on-launch', Values: ['false'] },
        { Name: 'ipv6-cidr-block-association.state', Values: ['associated'] },
      ],
    })
  )

  if (Subnets?.length < 1) {
    throw new Error(
      'expected at least one private dual-stack subnet, but found none'
    )
  }

  const VpcConfig = {
    SecurityGroupIds: [{ Ref: 'SecurityGroupEgressOnly' }],
    SubnetIds: Subnets.map(({ SubnetId }) => SubnetId),
    Ipv6AllowedForDualStack: true,
  }

  const SecurityGroupEgressOnly = {
    Type: 'AWS::EC2::SecurityGroup',
    Properties: {
      GroupDescription: 'Allow egress on all ports for Lambdas inside the VPC',
      SecurityGroupEgress: [
        { CidrIp: '0.0.0.0/0', IpProtocol: -1 },
        { CidrIpv6: '::/0', IpProtocol: -1 },
      ],
      VpcId,
    },
  }

  return { VpcConfig, SecurityGroupEgressOnly }
}

// Place selected Lambdas inside a VPC
export const deploy = {
  async start({
    cloudformation,
    inventory: {
      inv: { lambdasBySrcDir },
    },
  }) {
    const lambdasInVpcs = Object.values(lambdasBySrcDir).filter(
      ({ config: { vpc } }) => vpc
    )
    if (lambdasInVpcs.length > 0) {
      const { VpcConfig, SecurityGroupEgressOnly } = await getVpcConfig()

      const cfnPropsBySrcDir = Object.fromEntries(
        Object.values(cloudformation.Resources)
          .filter(({ Type }) => Type === 'AWS::Serverless::Function')
          .map(({ Properties }) => [Properties.CodeUri, Properties])
      )

      lambdasInVpcs.forEach(
        ({ src }) => (cfnPropsBySrcDir[src].VpcConfig = VpcConfig)
      )

      // Allow the Lambda runtime to attach to the VPC.
      // See https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc.html#configuration-vpc-permissions
      cloudformation.Resources.SecurityGroupEgressOnly = SecurityGroupEgressOnly
      ;(cloudformation.Resources.Role.Properties.ManagedPolicyArns ??= []).push(
        'arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole'
      )

      // Forbid the Lambda _itself_ from making the same EC2 calls so that its
      // code cannot directly modify VPC atachment.
      // See https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc.html#configuration-vpc-best-practice
      cloudformation.Resources.Role.Properties.Policies.push({
        PolicyName: 'DenyAWSLambdaVPCAccess',
        PolicyDocument: {
          Statement: [
            {
              Effect: 'Deny',
              Action: [
                'ec2:CreateNetworkInterface',
                'ec2:DeleteNetworkInterface',
                'ec2:DescribeNetworkInterfaces',
                'ec2:DetachNetworkInterface',
                'ec2:AssignPrivateIpAddresses',
                'ec2:UnassignPrivateIpAddresses',
              ],
              Resource: '*',
              Condition: {
                ArnEquals: {
                  'lambda:SourceFunctionArn': [
                    {
                      'Fn::Sub': `arn:aws:lambda:*:$\{AWS::AccountId}:*`,
                    },
                  ],
                },
              },
            },
          ],
        },
      })
    }
    return cloudformation
  },
}
