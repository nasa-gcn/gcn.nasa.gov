/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { generate } from 'generate-password'

let server

// Sandbox identity provider

export const set = {
  env({ inventory }) {
    const orig_env = inventory.inv._project.env.local?.[process.env.ARC_ENV]
    const env = {}
    if (process.env.ARC_ENV === 'testing' && !orig_env?.COGNITO_USER_POOL_ID) {
      if (!orig_env?.OIDC_CLIENT_ID) {
        env.OIDC_CLIENT_ID = generate({ length: 26 })
      }
      if (!orig_env?.OIDC_CLIENT_SECRET) {
        env.OIDC_CLIENT_SECRET = generate({ length: 51 })
      }
      if (!process.env.ARC_OIDC_IDP_PORT) {
        env.ARC_OIDC_IDP_PORT = 3334
      }
    }
    return { testing: env }
  },
}

export const sandbox = {
  async start() {
    if (!process.env.ARC_OIDC_IDP_PORT) return
    const { default: Provider } = await import('oidc-provider')
    const http_port = JSON.parse(process.env.ARC_SANDBOX).ports.http
    const issuer = `http://localhost:${process.env.ARC_OIDC_IDP_PORT}`
    const provider = new Provider(issuer, {
      // Return a dummy user
      async findAccount(ctx, id) {
        return {
          accountId: id,
          claims() {
            return {
              sub: id,
              email: 'user@example.com',
              'cognito:username': id,
              'cognito:groups': ['gcn.nasa.gov/kafka-public-consumer'],
              identities: [{ providerName: 'Local Sandbox' }],
            }
          },
        }
      },
      claims: {
        openid: [
          'sub',
          'email',
          'cognito:username',
          'cognito:groups',
          'identities',
        ],
      },
      // Register an app client for the web site
      clients: [
        {
          client_id: process.env.OIDC_CLIENT_ID,
          client_secret: process.env.OIDC_CLIENT_SECRET,
          grant_types: ['authorization_code', 'refresh_token'],
          redirect_uris: [`http://localhost:${http_port}/login`],
          post_logout_redirect_uris: [
            `http://localhost:${http_port}/post_logout`,
          ],
        },
      ],
      cookies: { keys: [generate({ length: 32 })] },
      // Always issue refresh token
      issueRefreshToken() {
        return true
      },
      // Skip authorization consent screen
      // See https://github.com/panva/node-oidc-provider/blob/main/recipes/skip_consent.md
      async loadExistingGrant(ctx) {
        const grantId =
          ctx.oidc.result?.consent?.grantId ||
          ctx.oidc.session.grantIdFor(ctx.oidc.client.clientId)

        if (grantId) {
          // keep grant expiry aligned with session expiry
          // to prevent consent prompt being requested when grant expires
          const grant = await ctx.oidc.provider.Grant.find(grantId)

          // this aligns the Grant ttl with that of the current session
          // if the same Grant is used for multiple sessions, or is set
          // to never expire, you probably do not want this in your code
          if (ctx.oidc.account && grant.exp < ctx.oidc.session.exp) {
            grant.exp = ctx.oidc.session.exp
            await grant.save()
          }

          return grant
        } else {
          const grant = new ctx.oidc.provider.Grant({
            clientId: ctx.oidc.client.clientId,
            accountId: ctx.oidc.session.accountId,
          })

          grant.addOIDCScope('openid')
          await grant.save()
          return grant
        }
      },
    })
    server = await provider.listen(process.env.ARC_OIDC_IDP_PORT)
  },
  async end() {
    await server?.close()
  },
}
