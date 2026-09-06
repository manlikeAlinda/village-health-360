FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Build-time env vars: NEXT_PUBLIC_* values are inlined into the client bundle
# at this step, not read at container startup — pass them as build args if
# they differ from .env.local for a given deployment target.
RUN npm run build

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
# next.config.ts sets output: "standalone", which traces only the dependencies
# this app actually uses instead of shipping the full node_modules tree.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
