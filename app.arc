@app
remix-gcn

@esbuild

@http
/*
  method any
  src src

@static

@tables
client_credentials
  subiss *String
  client_id **String

sessions
  _idx *String
  _ttl TTL

@aws
profile default
region us-east-1

@macros
lambdaMayNotWriteToStaticBucket  # the Lambda function should not be able to modify the static bucket
manualStaticBucketPolicy  # Mission Cloud Platform requires bucket policies to be set manually
permissionsBoundary  # configure IAM Role permissions boundaries required by Mission Cloud Platform

@plugins
arc-plugin-esbuild
