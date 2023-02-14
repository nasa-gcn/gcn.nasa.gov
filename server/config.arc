@aws
concurrency 100
provisionedConcurrency 5
timeout 10  # Allow extra time because Cognito's .well-known/openid-configuration endpoint can take several seconds.
