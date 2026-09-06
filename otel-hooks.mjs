// Registers the ESM loader hook that OpenTelemetry's instrumentation needs.
//
// The nitro server bundle is ESM, so it reaches node:http through `import`,
// not `require`. Instrumentation patches CJS by default and would silently see
// nothing -- the app would run perfectly and report no traces at all.
//
// This is a separate file, loaded by its own --import ahead of otel.mjs,
// because ESM hoists imports: anything in otel.mjs's own body would run after
// the SDK had already pulled in node:http, too late for the hook to take.
import { register } from 'node:module'

register('import-in-the-middle/hook.mjs', import.meta.url)
