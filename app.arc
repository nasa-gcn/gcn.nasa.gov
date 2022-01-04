@app
remix-gcn

@http
/*
  method any
  src server

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
permissionsBoundary  # configure IAM Role permissions boundaries required by Mission Cloud Platform
