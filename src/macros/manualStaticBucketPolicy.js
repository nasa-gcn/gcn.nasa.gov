// Mission Cloud Platform does not support user-defined bucket policies;
// they must be set manually by an administrator
module.exports = function manualStaticBucketPolicy(arc, sam) {
  delete sam.Resources.StaticBucketPolicy
  return sam
}
