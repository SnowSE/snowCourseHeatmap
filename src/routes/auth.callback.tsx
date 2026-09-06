import { createFileRoute } from '@tanstack/react-router'

const handler = async ({ request }: { request: Request }) => {
  const { completeLogin } = await import('@/auth/oidc')
  const { useAppSession } = await import('@/auth/session')
  const { getAuthConfig, emailAllowed } = await import('@/auth/config')

  const session = await useAppSession()
  const pending = session.data.pendingLogin

  const fail = async (reason: string) => {
    await session.update({ pendingLogin: undefined })
    return new Response(null, {
      status: 302,
      headers: { Location: `/auth/denied?reason=${encodeURIComponent(reason)}` },
    })
  }

  // No pending login means this callback was not started by us -- a stale tab,
  // a replayed link, or a forged request.
  if (!pending) return fail('expired')

  let claims: { email?: string; name?: string }
  try {
    // openid-client verifies the state and the id_token against the PKCE
    // verifier here; a mismatch throws rather than returning claims.
    claims = await completeLogin(new URL(request.url), {
      codeVerifier: pending.codeVerifier,
      state: pending.state,
    })
  } catch {
    return fail('failed')
  }

  const email = claims.email?.trim().toLowerCase()
  if (!email) return fail('no-email')

  if (!emailAllowed(email, getAuthConfig())) return fail('domain')

  await session.update({
    user: { email, name: claims.name },
    pendingLogin: undefined,
  })

  // Marks this request as a completed sign-in for otel.snowse.io. See the note
  // about __snowseIdentify in otel.mjs.
  ;(globalThis as { __snowseIdentify?: (email: string) => void }).__snowseIdentify?.(email)

  return new Response(null, { status: 302, headers: { Location: pending.returnTo } })
}

export const Route = createFileRoute('/auth/callback')({
  server: { handlers: { GET: handler } },
})
