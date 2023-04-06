@app
remix-gcn

@http
/*
  method any
  src build/server

@events
email-incoming
  src build/events/email-incoming

@tables-streams
circulars
  src build/table-streams/circulars

@static
fingerprint external
folder build/static

@tables
client_credentials
  sub *String
  client_id **String
  PointInTimeRecovery true

sessions
  _idx *String
  _ttl TTL

circulars_subscriptions
  email *String
  sub **String
  PointInTimeRecovery true

email_notification
  sub *String
  uuid **String
  PointInTimeRecovery true

email_notification_subscription
  uuid *String
  topic **String
  PointInTimeRecovery true

circular_endorsements
  requestorSub *String
  endorserSub **String
  PointInTimeRecovery true

circulars
  circularId *Number
  PointInTimeRecovery true

auto_increment_metadata
  tableName *String
  PointInTimeRecovery true

legacy_users
  email *String
  PointInTimeRecovery true

@tables-indexes
email_notification_subscription
  topic *String
  name byTopic
  
sessions
  sub *String
  name sessionsBySub

circular_endorsements
  endorserSub *String
  name circularEndorsementsByEndorserSub

circulars
  email *String
  name circularsByEmail

circulars_subscriptions
  sub *String
  name circularsSubscriptionsBySub

legacy_users
  receive *Number
  name legacyReceivers

@aws
runtime nodejs18.x
region us-east-1
architecture arm64
memory 256
tracing true

@storage-private
email-incoming

@search
instanceType t3.small.search
instanceCount 2
availabilityZoneCount 2
volumeSize 10

@plugins
remixLiveReload  # Workaround for Remix live reload bug, https://github.com/remix-run/remix/issues/198
sandboxOidcIdp  # Sandbox identity provider
lambdaCognitoPermissions  # Grant the Lambda function access to Cognito to run the credential vending machine.
lambdaMayNotWriteToStaticBucket  # the Lambda function should not be able to modify the static bucket
missionCloudPlatform  # Custom permissions for deployment on Mission Cloud Platform
sendEmailPermissions  # Grant the Lambda function permission to send email.
emailIncoming  # Enable notifications from SES to SNS to trigger email-incoming Lambda
nasa-gcn/architect-plugin-search  # Add an AWS OpenSearch Serverless collection.
nasa-gcn/architect-plugin-tracing  # Enable AWS X-Ray distributed tracing
architect/plugin-lambda-invoker
architect/plugin-storage-private
