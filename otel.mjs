// OpenTelemetry preload for the production server -> otel.snowse.io.
//
// Loaded with `node --import ./otel.mjs` so the HTTP module is patched before
// the server starts listening. Doing it here rather than inside the app means
// no application code has to know about telemetry at all.
//
// Two things are reported:
//   * traces, from HTTP instrumentation -- what broke and what was slow
//   * one app event per meaningful request, so the "Who's using what"
//     dashboard has something to count
//
// Static assets are skipped: they triple the volume and say nothing useful.
//
// Events are attributed to the signed-in person. The session cookie is sealed
// and this preload cannot read it, so the app hands the identity over instead:
// the auth middleware calls globalThis.__snowseIdentify(email), which stamps it
// on the active server span. Done through a global rather than an import so the
// app needs no @opentelemetry dependency -- see the note in the Dockerfile
// about why this project avoids touching pnpm-lock.yaml.
//
// Everything is off unless OTEL_EXPORTER_OTLP_ENDPOINT is set.

import { NodeSDK } from '@opentelemetry/sdk-node'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { SpanKind, trace } from '@opentelemetry/api'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'

const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT

if (endpoint) {
  const serviceName = process.env.OTEL_SERVICE_NAME ?? 'snowse-heatmap'

  // Called by the app's auth middleware, inside the request, so the active span
  // here is the HTTP server span the event is later derived from.
  globalThis.__snowseIdentify = (email) => {
    if (!email) return
    const span = trace.getActiveSpan()
    if (span) span.setAttribute('user.email', String(email).toLowerCase())
  }

  const IGNORED = /^\/(?:_build|assets|favicon|@vite|node_modules)\b|\.(?:js|mjs|css|map|png|jpe?g|svg|ico|woff2?|txt)$/

  const pathOf = (span) => {
    const a = span.attributes ?? {}
    const raw = a['url.path'] ?? a['http.target'] ?? a['http.route'] ?? ''
    return String(raw).split('?')[0]
  }

  // TanStack Start posts server-function calls to a path carrying the function
  // id, so the request path is enough to tell which feature was used without
  // touching the app's own code.
  //
  // Returns null for requests that are not usage. Without that, the login
  // handshake alone (login -> callback -> redirect) buries real activity: it is
  // several requests per sign-in, and every signed-out visitor generates
  // another as the gate bounces them.
  const eventNameFor = (path, status, identified) => {
    const segments = path.split('/').filter(Boolean)
    const safe = (value, fallback) => (String(value ?? '').replace(/[^\w-]/g, '') || fallback)

    if (segments[0] === 'auth') {
      // One event per completed sign-in, and nothing for the hops that get
      // there. A callback with no identity was a refusal, not a sign-in.
      return segments[1] === 'callback' && identified ? 'heatmap.auth.signed-in' : null
    }

    // The gate turning someone away is not usage. 302 is a signed-out page
    // load; 401 is a server function called with no session, which happens on
    // its own whenever a session expires under an open tab -- counting those
    // would quietly inflate every usage figure.
    if (status === 401 || (status >= 300 && status < 400)) return null

    if (segments[0] === '_serverFn') {
      return `heatmap.data.${safe(segments[1], 'unknown')}`
    }

    // Named per route so the dashboard's "Busiest actions" panel distinguishes
    // the scheduler from the heatmap instead of showing one lump of page views.
    return `heatmap.page.${safe(segments[0], 'index')}`
  }

  // Turning finished server spans into events keeps the "what is being used"
  // signal in Loki (30 days, never sampled) while the spans themselves are
  // tail-sampled and expire after 7.
  class UsageEventProcessor {
    onStart() {}

    onEnd(span) {
      if (span.kind !== SpanKind.SERVER) return

      const path = pathOf(span)
      if (!path || IGNORED.test(path)) return

      const status = Number(span.attributes?.['http.response.status_code'] ?? span.attributes?.['http.status_code'] ?? 0)
      const failed = status >= 500
      const email = span.attributes?.['user.email']

      const event = eventNameFor(path, status, Boolean(email))
      if (!event) return

      logs.getLogger(serviceName).emit({
        severityNumber: failed ? SeverityNumber.ERROR : SeverityNumber.INFO,
        severityText: failed ? 'ERROR' : 'INFO',
        body: event,
        attributes: {
          'app.event': event,
          'app.outcome': failed ? 'error' : 'ok',
          'user.email': email,
          'http.path': path,
          'http.status_code': status || undefined
        },
        context: undefined
      })
    }

    shutdown() {
      return Promise.resolve()
    }

    forceFlush() {
      return Promise.resolve()
    }
  }

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      'service.name': serviceName,
      'service.namespace': 'snowse',
      'deployment.environment': process.env.OTEL_ENVIRONMENT ?? 'prod'
    }),
    spanProcessors: [
      new BatchSpanProcessor(new OTLPTraceExporter({ url: `${endpoint}/v1/traces` })),
      new UsageEventProcessor()
    ],
    logRecordProcessors: [
      // Options object, not (exporter, config): the log processor's signature
      // differs from BatchSpanProcessor's, and passing the exporter positionally
      // fails at export time rather than at construction.
      new BatchLogRecordProcessor({ exporter: new OTLPLogExporter({ url: `${endpoint}/v1/logs` }) })
    ],
    instrumentations: [
      new HttpInstrumentation({
        ignoreIncomingRequestHook: (req) => IGNORED.test(String(req.url ?? '').split('?')[0])
      })
    ]
  })

  sdk.start()

  const stop = () => sdk.shutdown().catch(() => {}).finally(() => process.exit(0))
  process.on('SIGTERM', stop)
  process.on('SIGINT', stop)
}
