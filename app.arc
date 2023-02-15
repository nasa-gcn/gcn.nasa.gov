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
  dummy *Number  # dummy partition key so that all records are stored in one partition
  circularId **Number
  PointInTimeRecovery true

auto_increment_metadata
  tableName *String
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

@sandbox
invoker events

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
manualStaticBucketPolicy  # Mission Cloud Platform requires bucket policies to be set manually
permissionsBoundary  # configure IAM Role permissions boundaries required by Mission Cloud Platform
sendEmailPermissions  # Grant the Lambda function permission to send email.
emailIncoming  # Add a custom Lambda to process events for incoming emails
architect/plugin-lambda-invoker
