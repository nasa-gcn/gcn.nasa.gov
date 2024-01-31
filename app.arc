@app
remix-gcn

@http
/*
  method any
  src build/server

/labs/api/*
  method any
  src python

@email-incoming
circulars
  src build/email-incoming/circulars

support
  src build/email-incoming/support

@scheduled
ads
  cron 0 8 ? * MON *
  src build/scheduled/ads
circulars
  rate 1 day
  src build/scheduled/circulars

@tables-streams
circulars
  src build/table-streams/circulars

synonyms
  src build/table-streams/synonyms

@static
fingerprint external
folder build/static
prefix app

@tables
client_credentials
  sub *String
  client_id **String
  PointInTimeRecovery true

acrossapi_tle
  satname *String
  epoch **String
  tle1 String
  tle2 String

sessions
  _idx *String
  _ttl TTL

announcement_subscriptions
  email *String
  sub **String
  PointInTimeRecovery true

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

synonyms
  eventId *String
  synonymId **String
  PointInTimeRecovery true

auto_increment_metadata
  tableName *String
  PointInTimeRecovery true

circulars_history
  circularId *Number
  version **Number
  PointInTimeRecovery true

circulars_change_requests
  circularId *Number
  requestorSub **String
  PointInTimeRecovery true

legacy_users
  email *String
  PointInTimeRecovery true

@tables-indexes
email_notification_subscription
  topic *String
  name byTopic

email_notification
  recipient *String
  name byRecipient

email_notification_subscription
  recipient *String
  name byRecipient

sessions
  sub *String
  name sessionsBySub

circular_endorsements
  endorserSub *String
  name circularEndorsementsByEndorserSub

circulars
  email *String
  name circularsByEmail

circulars
  eventId *String
  name circularsByEventId

circulars_subscriptions
  sub *String
  name circularsSubscriptionsBySub

announcement_subscriptions
  sub *String
  name announcementSubscriptionsBySub

legacy_users
  receive *Number
  name legacyReceivers

legacy_users
  receiveAnnouncements *Number
  name legacyAnnouncementReceivers

synonyms
  synonymId *String
  name synonymsById

@aws
runtime nodejs20.x
region us-east-1
architecture arm64
memory 256
timeout 30
hydrate false

@search
instanceType t3.small.search
instanceCount 3
availabilityZoneCount 3
volumeSize 10
dedicatedMasterCount 3
dedicatedMasterType t3.small.search

@plugins
plugin-remix
sandboxOidcIdp  # Sandbox identity provider
lambdaCognitoPermissions  # Grant the Lambda function access to Cognito to run the credential vending machine.
staticBucketPermissions  # Functions may only write to the /generated directory in the static bucket.
missionCloudPlatform  # Custom permissions for deployment on Mission Cloud Platform
emailOutgoing  # Grant the Lambda function permission to send email; add email templates.
email-incoming  # Enable Lambda handlers for incoming emails
nasa-gcn/architect-plugin-search  # Add an AWS OpenSearch Serverless collection.
architect/plugin-lambda-invoker
