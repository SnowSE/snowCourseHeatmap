import { createFileRoute } from '@tanstack/react-router'

const handler = async () => {
  const { useAppSession } = await import('@/auth/session')

  const session = await useAppSession()
  await session.clear()

  // Only this site's session is cleared, not the Keycloak one -- the same as
  // tools.snowse.io, so signing out here does not sign you out of every other
  // college site in the browser.
  return new Response(null, { status: 302, headers: { Location: '/auth/denied?reason=signed-out' } })
}

export const Route = createFileRoute('/auth/logout')({
  server: { handlers: { GET: handler } },
})
