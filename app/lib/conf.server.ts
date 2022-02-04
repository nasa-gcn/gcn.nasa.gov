/*
 * Cognito user pool ID.
 *
 * Note that this is safe to include in public code because it is public
 * knowledge anyway:
 * - When a user clicks "Login" on the site, they are redirected to the Cognito
 *   hosted UI. From the URL of the Cognito hosted UI, it is easy to work out
 *   the public OpenID Connect discovery URL, whose response discloses the
 *   Cognito user pool ID.
 * - The Cognito user pool ID is easily deduced from the OpenID token endpoint
 *   URL, which is public knowledge because it is part of the client
 *   configuration for end users.
 *
 * FIXME: this should be parameterized for dev, test, and prod deployments,
 * all of which will eventually have independent OIDC providers.
 */
export const COGNITO_USER_POOL_ID = 'us-east-1_37HQxlQvW'
