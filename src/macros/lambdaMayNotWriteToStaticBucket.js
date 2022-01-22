// The Lambda function should not be able to modify the static bucket.
module.exports = function lambdaMayNotWriteToStaticBucket(arc, sam) {
  sam.Resources.Role.Properties.Policies =
    sam.Resources.Role.Properties.Policies.map((policy) => {
      if (policy.PolicyName == 'ArcStaticBucketPolicy')
        policy.PolicyDocument.Statement[0].Action = ['s3:GetObject']
      return policy
    })
  return sam
}
