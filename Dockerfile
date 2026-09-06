FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++ gcc musl-dev

# Pinned, not @latest: pnpm 11 ignores this repo's pnpm-workspace.yaml settings
# (onlyBuiltDependencies) and the lockfile is v9. 10.33.4 matches local dev.
RUN npm install -g pnpm@10.33.4

# pnpm-workspace.yaml carries onlyBuiltDependencies (better-sqlite3); without it
# pnpm 10 refuses the install with ERR_PNPM_IGNORED_BUILDS.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

RUN pnpm rebuild better-sqlite3

COPY . .

RUN pnpm run build

# nitro leaves better-sqlite3 external, so the native module has to ship next to
# the server bundle. Built here with npm into a flat, real directory: pnpm's own
# node_modules entries are symlinks into its virtual store and don't survive a
# COPY --from into another stage.
RUN mkdir /native && cd /native && npm install better-sqlite3@12.6.2 --build-from-source

# The OpenTelemetry preload (otel.mjs) runs outside the nitro bundle, so its
# packages have to exist in the runtime image. Pinned here rather than added to
# package.json: the app never imports them, and adding them would invalidate
# pnpm-lock.yaml and break the --frozen-lockfile install above. Installed flat
# with npm for the same reason better-sqlite3 is -- pnpm's node_modules are
# symlinks into a virtual store and do not survive COPY --from.
RUN mkdir /otel && cd /otel && npm install --omit=dev \
      @opentelemetry/api@^1.9.1 \
      @opentelemetry/api-logs@^0.222.0 \
      @opentelemetry/sdk-node@^0.222.0 \
      @opentelemetry/sdk-logs@^0.222.0 \
      @opentelemetry/sdk-trace-base@^2.11.0 \
      @opentelemetry/instrumentation-http@^0.222.0 \
      @opentelemetry/exporter-trace-otlp-http@^0.222.0 \
      @opentelemetry/exporter-logs-otlp-http@^0.222.0 \
      @opentelemetry/resources@^2.11.0

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./
COPY --from=builder /native/node_modules ./.output/server/node_modules
COPY --from=builder /otel/node_modules ./node_modules
COPY otel.mjs otel-hooks.mjs ./

EXPOSE 3000

ENV NODE_ENV=production

# --import runs the preloads before the server bundle, which is what lets the
# HTTP instrumentation patch the module before anything starts listening.
# otel-hooks.mjs must come first; see the comment in that file.
CMD ["node", "--import", "./otel-hooks.mjs", "--import", "./otel.mjs", ".output/server/index.mjs"]
