FROM oven/bun:1.3.9 AS base

WORKDIR /app


FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --no-save --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV HOST=cs111-back.study-with-me.org
ENV NEXT_PUBLIC_HOST=cs111-back.study-with-me.org
RUN bun run build


FROM base AS runner
WORKDIR /app


ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE 3000

CMD ["bun", "./server.js", "--hostname"]