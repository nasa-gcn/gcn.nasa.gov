@app
remix-gcn

@http
/*
  method any
  src server

@static
fingerprint external

@tables
client_credentials
  sub *String
  client_id **String
  PointInTimeRecovery true

sessions
  _idx *String
  _ttl TTL

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

@aws
runtime nodejs18.x
region us-east-1
architecture arm64
memory 256

@plugins
tracing  # Enable AWS X-Ray distributed tracing
remixLiveReload  # Workaround for Remix live reload bug, https://github.com/remix-run/remix/issues/198
sandboxOidcIdp  # Sandbox identity provider
lambdaCognitoPermissions  # Grant the Lambda function access to Cognito to run the credential vending machine.
lambdaMayNotWriteToStaticBucket  # the Lambda function should not be able to modify the static bucket
missionCloudPlatform  # Custom permissions for deployment on Mission Cloud Platform
sendEmailPermissions  # Grant the Lambda function permission to send email.
emailIncoming  # Add a custom Lambda to process events for incoming emails
nasa-gcn/architect-plugin-search  # Add an AWS OpenSearch Serverless collection.
architect/plugin-lambda-invoker
