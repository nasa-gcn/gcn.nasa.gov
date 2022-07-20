const { Provider } = require('oidc-provider')
const crypto = require('crypto')
require('dotenv').config()

const LOCAL_OIDC_CLIENT_PORT = process.env.LOCAL_OIDC_PORT
const LOCAL_OIDC_PROVIDER = 'http://localhost:' + LOCAL_OIDC_CLIENT_PORT
const LOCAL_OIDC_CLIENT_ID = crypto.randomBytes(20).toString('hex')
const LOCAL_OIDC_CLIENT_SECRET = crypto.randomBytes(20).toString('hex')

const configuration = {
  // ... see /docs for available configuration
  clients: [
    {
      client_id: LOCAL_OIDC_CLIENT_ID,
      client_secret: LOCAL_OIDC_CLIENT_SECRET,
      redirect_uris: ['http://localhost:3333/login'],
      post_logout_redirect_uris: ['http://localhost:3333'],
      // + other client properties
    },
  ],
  claims: {
    openid: ['email', 'email_verified'],
  },
  features: {
    devInteractions: { enabled: true }, // defaults to true

    deviceFlow: { enabled: true }, // defaults to false
    revocation: { enabled: true }, // defaults to false
  },
  scopes: ['openid', 'email', 'phone', 'profile'],
  responseTypes: ['code', 'id_token'],
  routes: {
    end_session: '/logout',
  },
  async findAccount(ctx, id) {
    return {
      accountId: id,
      async claims(use, scope) {
        return {
          sub: id,
          email: 'local-user@tach.com',
          email_verified: false,
        }
      },
    }
  },
}

module.exports = {
  sandbox: {
    start: async ({ arc, inventory, invoke }) => {
      const oidc = new Provider(LOCAL_OIDC_PROVIDER, configuration)

      oidc.listen(3000, () => {
        console.log(
          'oidc-provider listening on port ' +
            LOCAL_OIDC_CLIENT_PORT +
            ', check ' +
            LOCAL_OIDC_PROVIDER +
            '/.well-known/openid-configuration'
        )
      })
    },
  },
  set: {
    env: ({ arc, inventory }) => {
      if (process.env.NODE_ENV === 'production') {
        return {
          OIDC_PROVIDER: `https://cognito-idp.${
            process.env.COGNITO_USER_POOL_ID.split('_')[0]
          }.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/`,
          OIDC_CLIENT_ID: process.env.COGNITO_OIDC_CLIENT_ID,
          OIDC_CLIENT_SECRET: process.env.COGNITO_OIDC_CLIENT_SECRET,
        }
      } else {
        return {
          OIDC_PROVIDER: LOCAL_OIDC_PROVIDER,
          OIDC_CLIENT_ID: LOCAL_OIDC_CLIENT_ID,
          OIDC_CLIENT_SECRET: LOCAL_OIDC_CLIENT_SECRET,
        }
      }
    },
  },
}
