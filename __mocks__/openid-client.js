const openid_client = jest.createMockFromModule('openid-client')

openid_client.TokenSet = {}

module.exports = openid_client
