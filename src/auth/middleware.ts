import { createMiddleware } from '@tanstack/react-start'

// The single gate for the whole site.
//
// Global request middleware runs before the framework decides whether a request
// is a page load or a server-function call, so this one check covers both. That
// matters: server functions are ordinary HTTP endpoints, and gating only the
// page render would leave every one of them callable by anyone with the URL.
// Because the gate is here rather than on each function, a server function
// added later is protected without anyone remembering to protect it.

// Static assets must stay reachable while signed out, or the "no access" page
// would load without its stylesheet.
const PUBLIC_PATH = /^\/(?:assets|_build|@vite|@fs|node_modules|__|favicon)|\.[a-z0-9]+$/i

const serverFunctionCall = (pathname: string) => pathname.startsWith('/_serverFn')

export const requireLogin = createMiddleware({ type: 'request' }).server(
  async ({ request, next }) => {
    // Derived rather than taken from the middleware options: `pathname` is
    // declared on the type but is not actually populated at runtime in
    // @tanstack/start-server-core 1.141, where the first middleware receives
    // only { request, context }.
    const { pathname } = new URL(request.url)

    // The login handshake itself, and the page that explains a refusal.
    if (pathname.startsWith('/auth/') || PUBLIC_PATH.test(pathname)) {
      return next()
    }

    const { authConfigured } = await import('./config')

    // Only reachable on a Vite dev server with no OIDC environment. In a
    // production build this is compiled away, so there is no runtime switch
    // that could turn authentication off.
    if (!authConfigured()) {
      return next()
    }

    const { currentUser } = await import('./session')
    const user = await currentUser()

    if (user) {
      // Attributes this request to a person on otel.snowse.io. The hook is
      // installed by otel.mjs and is simply absent when telemetry is off.
      ;(globalThis as { __snowseIdentify?: (email: string) => void }).__snowseIdentify?.(user.email)
      return next()
    }

    // A server function answered with a redirect would be followed by fetch and
    // hand the caller a login page as if it were data, so say plainly that the
    // session is gone and let the client send the person to log in again.
    if (serverFunctionCall(pathname)) {
      return new Response('Not signed in', { status: 401 })
    }

    return new Response(null, {
      status: 302,
      headers: { Location: `/auth/login?returnTo=${encodeURIComponent(pathname)}` },
    })
  },
)
