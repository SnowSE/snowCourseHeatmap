import { createFileRoute } from '@tanstack/react-router'

// Server-only: the `server.handlers` block is stripped from the client bundle,
// which is what keeps openid-client and the session secret off the browser.
const handler = async ({ request }: { request: Request }) => {
  const { startLogin } = await import('@/auth/oidc')
  const { useAppSession } = await import('@/auth/session')

  const requested = new URL(request.url).searchParams.get('returnTo')
  // Only same-site paths, so ?returnTo= cannot be used to bounce someone to
  // another domain after they log in.
  const returnTo = requested?.startsWith('/') && !requested.startsWith('//') ? requested : '/'

  const { url, codeVerifier, state } = await startLogin()

  const session = await useAppSession()
  await session.update({ pendingLogin: { codeVerifier, state, returnTo } })

  return new Response(null, { status: 302, headers: { Location: url } })
}

export const Route = createFileRoute('/auth/login')({
  server: { handlers: { GET: handler } },
})
