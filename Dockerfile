# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++ gcc musl-dev

# Install pnpm
RUN npm install -g pnpm@latest

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild better-sqlite3 for Alpine Linux
RUN pnpm rebuild better-sqlite3

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install runtime dependencies for better-sqlite3
RUN apk add --no-cache libstdc++

# Install pnpm
RUN npm install -g pnpm@latest

# Copy built application and node_modules with native bindings
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Expose port
EXPOSE 3000

# Set NODE_ENV to production
ENV NODE_ENV=production

# Start the application
CMD ["node", ".output/server/index.mjs"]
