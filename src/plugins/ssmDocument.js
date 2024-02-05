/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export const deploy = {
  start({ cloudformation }) {
    cloudformation.Resources.KafkaSSMDocument = {
      Type: 'AWS::SSM::Document',
      Properties: {
        Content: {
          schemaVersion: '2.2',
          description: 'Update Kafka acls',
          parameters: {
            ConsumerGroup: {
              type: 'String',
              description: 'Consumer Group name to be associated with a topic',
              default: '',
            },
            ProducerGroup: {
              type: 'String',
              description: 'Producer Group name to be associated with a topic',
              default: '',
            },
            Topic: {
              type: 'String',
              description: 'Name of the new topic',
              default: '',
            },
          },
          mainSteps: [
            {
              action: 'aws:runShellScript',
              name: 'AssociateGroupsWithTopics',
              inputs: {
                runCommand: [
                  "kafka-acls --bootstrap-server=localhost:9091 --add --allow-principal 'User:{{ConsumerGroup}}' --group '*' --topic '{{Topic}}' --consumer",
                  "kafka-acls --bootstrap-server=localhost:9091 --add --allow-principal 'User:{{ProducerGroup}}' --group '*' --topic '{{Topic}}' --producer",
                  "kafka-acls --bootstrap-server=localhost:9091 --add --allow-principal 'User:{{ConsumerGroup}}' --group '*' --topic '{{Topic}}.' --resource-pattern-type PREFIXED --consumer",
                  "kafka-acls --bootstrap-server=localhost:9091 --add --allow-principal 'User:{{ProducerGroup}}' --group '*' --topic '{{Topic}}.' --resource-pattern-type PREFIXED --producer",
                ],
              },
            },
          ],
        },
        DocumentType: 'Command',
        Name: 'KafkaACLUpdate',
      },
    }
    return cloudformation
  },
}
