@app
remix-gcn

@http
/*
  method any
  src server

@static

@tables
client_credentials
  sub *String
  client_id **String

sessions
  _idx *String
  _ttl TTL

user_data
  sub *String

email_notification
  sub *String
  uuid **String

email_notification_subscription
  uuid *String
  topic **String

circular_permission_requests
  sub *String
  uuid **String

circular_email_subscriptions
  sub *String

gcn_circulars
  id *String
  created **String

@tables-indexes
email_notification_subscription
  topic *String
  name byTopic

circular_permission_requests
  endorserEmail *String
  name byEndorserEmail

circular_permission_requests
  uuid *String
  name byUUID
  
gcn_circulars
  sub *String
  name byUserSub

@tables-streams
gcn_circulars

circular_permission_requests

@aws
runtime nodejs16.x
region us-east-1
architecture arm64
memory 256
concurrency 100
provisionedConcurrency 5

@plugins
lambdaCognitoPermissions  # Grant the Lambda function access to Cognito to run the credential vending machine.
lambdaMayNotWriteToStaticBucket  # the Lambda function should not be able to modify the static bucket
manualStaticBucketPolicy  # Mission Cloud Platform requires bucket policies to be set manually
permissionsBoundary  # configure IAM Role permissions boundaries required by Mission Cloud Platform
sendEmailPermissions  # Grant the Lambda function permission to send email.