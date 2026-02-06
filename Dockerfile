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

# Install build and runtime dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++ gcc musl-dev libstdc++

# Install pnpm
RUN npm install -g pnpm@latest

# Copy built application
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./

# Create .output/server/node_modules if it doesn't exist
RUN mkdir -p .output/server/node_modules

# Install better-sqlite3 directly in the output directory
WORKDIR /app/.output/server
RUN npm install better-sqlite3@12.6.2 --build-from-source

# Return to app directory
WORKDIR /app

# Expose port
EXPOSE 3000

# Set NODE_ENV to production
ENV NODE_ENV=production

# Start the application
CMD ["node", ".output/server/index.mjs"]
