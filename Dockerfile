FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++ gcc musl-dev

RUN npm install -g pnpm@latest

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

RUN pnpm rebuild better-sqlite3

COPY . .

RUN pnpm run build

FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ gcc musl-dev libstdc++

RUN npm install -g pnpm@latest

RUN mkdir -p .output/server/node_modules

WORKDIR /app/.output/server
RUN npm install better-sqlite3@12.6.2 --build-from-source

WORKDIR /app

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", ".output/server/index.mjs"]
