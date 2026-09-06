import { createStart } from '@tanstack/react-start'
import { requireLogin } from './auth/middleware'

// TanStack Start picks this file up automatically (src/start.ts) and applies
// the middleware to every request the server handles.
export const startInstance = createStart(() => ({
  requestMiddleware: [requireLogin],
}))
