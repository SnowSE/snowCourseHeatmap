// Server-only. The session is a sealed (encrypted and signed) cookie, so there
// is no session store to run and a restart does not sign everyone out.

import { useSession } from '@tanstack/react-start/server'
import { getAuthConfig } from './config'

export type SessionUser = {
  email: string
  name?: string
}

export type AppSessionData = {
  user?: SessionUser
  // Only set between /auth/login and /auth/callback.
  pendingLogin?: {
    codeVerifier: string
    state: string
    returnTo: string
  }
}

export const useAppSession = () => {
  const config = getAuthConfig()

  return useSession<AppSessionData>({
    name: 'heatmap_session',
    password: config.sessionSecret,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.secureCookies,
      path: '/',
      // Bounded so a session on a shared or forgotten machine does not stay
      // valid indefinitely. Signing back in is one redirect, since Keycloak
      // still has its own session.
      maxAge: 60 * 60 * 12,
    },
  })
}

export const currentUser = async (): Promise<SessionUser | undefined> => {
  const session = await useAppSession()
  return session.data.user
}
