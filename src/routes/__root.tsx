import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  Outlet,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import { TermProvider } from '../contexts/TermContext'
import { Header } from '../components/Header'

import appCss from '../styles.css?url'
import type { QueryClient } from '@tanstack/react-query'
import type { TRPCRouter } from '@/integrations/trpc/router'
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  trpc: TRPCOptionsProxy<TRPCRouter>
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Engineering Scheduler',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  component: RootComponent,
  shellComponent: RootDocument,
})

function RootComponent() {
  return (
    <TermProvider>
      <div className="h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 p-4 text-slate-200 flex flex-col">
        <div>
          <Header />
        </div>
        <div className="flex-1 min-h-0">
          <Outlet />
        </div>
      </div>
    </TermProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="">
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
