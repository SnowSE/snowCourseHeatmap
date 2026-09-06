import { createServerFn } from '@tanstack/react-start'
import type { SessionUser } from './session'

/**
 * Who is signed in, for display only. Access is decided by the request
 * middleware before this ever runs; this just tells the header whose name to
 * show. Returns null on the "no access" page, which is the one page that
 * renders without a session.
 */
export const getSessionUser = createServerFn().handler(async (): Promise<SessionUser | null> => {
  'use server'
  const { authConfigured } = await import('./config')

  if (!authConfigured()) {
    return { email: 'dev@localhost', name: 'Local dev' }
  }

  const { currentUser } = await import('./session')
  return (await currentUser()) ?? null
})
