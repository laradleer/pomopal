# syntax=docker/dockerfile:1

# ---- 1. Dependencies: cached until package*.json changes ----
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Skip lifecycle scripts here: `nuxt prepare` needs the source, which isn't copied yet.
RUN npm ci --ignore-scripts

# ---- 2. Build: produces the self-contained .output/ folder ----
FROM deps AS build
COPY . .
RUN npx nuxt prepare && npm run build

# ---- 3. Runtime: only the build output, no source or node_modules ----
FROM node:24-alpine AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000
WORKDIR /app
COPY --from=build --chown=node:node /app/.output ./.output
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", ".output/server/index.mjs"]
