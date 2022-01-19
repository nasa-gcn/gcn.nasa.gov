// Add required permissions boundary for working on the Mission Cloud Platform
module.exports = function permissionsBoundary(arc, sam) {
  sam.Resources.Role.Properties.PermissionsBoundary = {
    'Fn::Sub': 'arn:aws:iam::${AWS::AccountId}:policy/mcp-tenantOperator',
  }
  return sam
}
