// Server-only. The Keycloak conversation.
//
// Deliberately dependency-free. Adding an OIDC library would have meant
// re-resolving pnpm-lock.yaml, and because this project depends on
// `nitro: "latest"` that drags an upgrade of the (alpha) server stack along
// with it -- too much collateral for one login feature.
//
// Nothing security-sensitive is hand-rolled to get here:
//   * PKCE (S256) and `state` are generated with node:crypto and verified by
//     Keycloak and by us respectively.
//   * The identity is read from the userinfo endpoint over TLS rather than by
//     parsing an id_token, so there is no JWT signature checking to get wrong.
//     tools.snowse.io and passwordreset.snowse.io both read userinfo too.

import { createHash, randomBytes } from 'node:crypto'
import { getAuthConfig } from './config'

type Discovery = {
  authorization_endpoint: string
  token_endpoint: string
  userinfo_endpoint: string
}

let discovered: Promise<Discovery> | null = null

const discovery = (): Promise<Discovery> => {
  if (!discovered) {
    const { issuer } = getAuthConfig()

    discovered = fetch(`${issuer}/.well-known/openid-configuration`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Keycloak discovery failed with HTTP ${response.status}`)
        }
        return (await response.json()) as Discovery
      })
      .catch((error) => {
        // Never cache a failure: one blip at startup would otherwise break
        // login until the container was restarted.
        discovered = null
        throw error
      })
  }

  return discovered
}

const base64url = (input: Buffer) => input.toString('base64url')

export type LoginRedirect = {
  url: string
  codeVerifier: string
  state: string
}

export const startLogin = async (): Promise<LoginRedirect> => {
  const config = getAuthConfig()
  const { authorization_endpoint } = await discovery()

  const codeVerifier = base64url(randomBytes(32))
  const codeChallenge = base64url(createHash('sha256').update(codeVerifier).digest())
  const state = base64url(randomBytes(16))

  const url = new URL(authorization_endpoint)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', config.clientId)
  url.searchParams.set('redirect_uri', config.redirectUri)
  url.searchParams.set('scope', 'openid profile email')
  url.searchParams.set('code_challenge', codeChallenge)
  url.searchParams.set('code_challenge_method', 'S256')
  url.searchParams.set('state', state)

  // Skips Keycloak's identity-provider chooser and lands people straight on the
  // college login, the same as tools.snowse.io.
  if (config.idpHint) {
    url.searchParams.set('kc_idp_hint', config.idpHint)
  }

  return { url: url.href, codeVerifier, state }
}

export type Identity = {
  email?: string
  name?: string
}

export const completeLogin = async (
  callbackUrl: URL,
  expected: { codeVerifier: string; state: string },
): Promise<Identity> => {
  const config = getAuthConfig()
  const { token_endpoint, userinfo_endpoint } = await discovery()

  const returnedState = callbackUrl.searchParams.get('state')
  const code = callbackUrl.searchParams.get('code')

  // Keycloak reports a refusal (e.g. the person cancelled) as ?error=.
  if (!code) {
    throw new Error(`no authorization code: ${callbackUrl.searchParams.get('error') ?? 'unknown'}`)
  }

  // Guards against a login response being replayed into someone else's session.
  if (!returnedState || returnedState !== expected.state) {
    throw new Error('state mismatch')
  }

  const tokenResponse = await fetch(token_endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirectUri,
      // Public client: identified by client_id, proven by the PKCE verifier.
      client_id: config.clientId,
      code_verifier: expected.codeVerifier,
    }),
  })

  if (!tokenResponse.ok) {
    throw new Error(`token exchange failed with HTTP ${tokenResponse.status}`)
  }

  const { access_token: accessToken } = (await tokenResponse.json()) as { access_token?: string }
  if (!accessToken) {
    throw new Error('token response carried no access token')
  }

  const userinfoResponse = await fetch(userinfo_endpoint, {
    headers: { authorization: `Bearer ${accessToken}` },
  })

  if (!userinfoResponse.ok) {
    throw new Error(`userinfo failed with HTTP ${userinfoResponse.status}`)
  }

  const claims = (await userinfoResponse.json()) as Record<string, unknown>

  return {
    email: typeof claims.email === 'string' ? claims.email : undefined,
    name: typeof claims.name === 'string' ? claims.name : undefined,
  }
}
