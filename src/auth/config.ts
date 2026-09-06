// Server-only. Never import this from a component.
//
// Deliberately mirrors how tools.snowse.io is configured, and reuses the same
// Keycloak client id, so there is one client to maintain rather than two. That
// client is public (PKCE, no secret), which is why nothing here is a secret
// except SESSION_SECRET.

export type AuthConfig = {
  issuer: string
  clientId: string
  redirectUri: string
  idpHint: string
  allowedDomains: Array<string>
  sessionSecret: string
  secureCookies: boolean
}

let cached: AuthConfig | null = null

const required = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `${name} is not set. The site cannot verify who is signing in without it, so it refuses to serve rather than let everyone through.`,
    )
  }
  return value
}

/**
 * Whether login is configured at all. False only on a Vite dev server with no
 * OIDC environment; `import.meta.env.DEV` is baked to false at build time, so a
 * production container can never take that branch no matter how it is run.
 */
export const authConfigured = (): boolean =>
  !(import.meta.env.DEV && !process.env.OIDC_ISSUER)

export const getAuthConfig = (): AuthConfig => {
  if (cached) return cached

  const redirectUri = required('OIDC_REDIRECT_URI')

  cached = {
    issuer: required('OIDC_ISSUER'),
    clientId: required('OIDC_CLIENT_ID'),
    redirectUri,
    idpHint: process.env.OIDC_IDP_HINT ?? '',
    // Who is actually allowed in, by e-mail domain. Anyone Keycloak
    // authenticates whose address is outside this list is turned away at
    // /auth/denied rather than silently given access.
    allowedDomains: (process.env.ALLOWED_EMAIL_DOMAINS ?? 'snow.edu,students.snow.edu')
      .split(',')
      .map((domain) => domain.trim().toLowerCase())
      .filter(Boolean),
    sessionSecret: required('SESSION_SECRET'),
    secureCookies: redirectUri.startsWith('https://'),
  }

  return cached
}

export const emailAllowed = (email: string, config: AuthConfig): boolean => {
  const domain = email.toLowerCase().split('@')[1]
  return domain !== undefined && config.allowedDomains.includes(domain)
}
