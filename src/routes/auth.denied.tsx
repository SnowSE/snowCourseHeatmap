import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const REASONS: Record<string, { title: string; detail: string }> = {
  domain: {
    title: 'That account cannot use this site',
    detail:
      'You signed in successfully, but this site is limited to Snow College accounts. Sign in with your snow.edu or students.snow.edu address.',
  },
  'no-email': {
    title: 'No e-mail address on that account',
    detail:
      'Snow College sign-in did not return an e-mail address, so there is no way to tell who you are. Contact the site owner if this keeps happening.',
  },
  expired: {
    title: 'That sign-in link has expired',
    detail: 'Sign-in takes a few minutes at most. Start again and it should work.',
  },
  failed: {
    title: 'Sign-in did not complete',
    detail: 'Something went wrong talking to Snow College sign-in. Trying again usually clears it.',
  },
  'signed-out': {
    title: 'Signed out',
    detail: 'You have been signed out of the course scheduler.',
  },
}

const searchSchema = z.object({ reason: z.string().optional() })

function DeniedPage() {
  const { reason } = Route.useSearch()
  const { title, detail } = REASONS[reason ?? ''] ?? {
    title: 'You need to sign in',
    detail: 'This site is limited to Snow College accounts.',
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-30 from-slate-900 via-slate-800 to-slate-900 p-6 text-slate-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/60 bg-slate-900/70 p-8 shadow-2xl">
        <h1 className="text-xl font-semibold text-slate-100">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{detail}</p>
        <a
          href="/auth/login"
          className="mt-7 inline-flex w-full items-center justify-center rounded-lg bg-blue-900 px-5 py-2.5 font-semibold text-slate-100 shadow-md transition-all hover:bg-blue-800 hover:shadow-lg"
        >
          Sign in with Snow College
        </a>
        {/* A plain anchor, not a Link: client-side routing would leave the
            browser signed out on a page that needs a session, and the first
            data call would fail with a 401 instead of a trip to sign in. */}
        <a href="/" className="mt-4 block text-center text-xs text-slate-500 hover:text-slate-300">
          Back to the course scheduler
        </a>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/auth/denied')({
  validateSearch: searchSchema,
  component: DeniedPage,
})
