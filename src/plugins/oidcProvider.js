const { Provider } = require('oidc-provider')
const configuration = {
  // ... see /docs for available configuration
  clients: [
    {
      client_id: '6qa6a6rq65ncanflojnknqt1ae',
      client_secret: '1530ks93a1d8inrpfvd73ccu2de7bf8iq033b1873brpa8qmukc0',
      redirect_uris: ['http://localhost:3333/login'],
      // + other client properties
    },
  ],
  claims: {
    address: ['address'],
    email: ['email', 'email_verified'],
    phone: ['phone_number', 'phone_number_verified'],
    profile: [
      'birthdate',
      'family_name',
      'gender',
      'given_name',
      'locale',
      'middle_name',
      'name',
      'nickname',
      'picture',
      'preferred_username',
      'profile',
      'updated_at',
      'website',
      'zoneinfo',
    ],
  },
  features: {
    devInteractions: { enabled: true }, // defaults to true

    deviceFlow: { enabled: true }, // defaults to false
    revocation: { enabled: true }, // defaults to false
  },
  scopes: ['openid', 'email', 'phone', 'profile'],
  responseTypes: ['code', 'id_token'],
  async findById(ctx, id) {
    return {
      accountId: 'V1StGXR8_Z5jdHi6B-myT',
      async claims(use, scope) {
        return {
          sub: 'V1StGXR8_Z5jdHi6B-myT',

          address: {
            country: '000',
            formatted: '000',
            locality: '000',
            postal_code: '000',
            region: '000',
            street_address: '000',
          },
          birthdate: '1987-10-16',
          email: 'johndoe@example.com',
          email_verified: false,
          family_name: 'Doe',
          gender: 'male',
          given_name: 'John',
          locale: 'en-US',
          middle_name: 'Middle',
          name: 'John Doe',
          nickname: 'Johny',
          phone_number: '+49 000 000000',
          phone_number_verified: false,
          picture: 'http://lorempixel.com/400/200/',
          preferred_username: 'johnny',
          profile: 'https://johnswebsite.com',
          updated_at: 1454704946,
          website: 'http://example.com',
          zoneinfo: 'Europe/Berlin',
        }
      },
    }
  },
}

module.exports = {
  sandbox: {
    start: async ({ arc, inventory, invoke }) => {
      const PORT = inventory.inv._project.env.local.testing.LOCAL_OIDC_PORT

      const oidc = new Provider('http://localhost:' + PORT, configuration)

      oidc.listen(3000, () => {
        console.log(
          'oidc-provider listening on port 3000, check http://localhost:3000/.well-known/openid-configuration'
        )
      })
    },
  },
}
