# KCwork prototype — Next App Router + vinext (Cloudflare workerd SSR)
#
# NOTE: `vinext` and `wrangler` live in devDependencies but are required to run
# `npm start` (which runs `vinext start`). Do NOT prune dev deps in this image.
# Requires Node >= 22.13.0 (engines.node); node:22 satisfies it.

FROM node:22-bookworm-slim

WORKDIR /app

# Install dependencies first (cached layer)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build the production artifact
COPY . .
RUN npm run build

# vinext start serves on 0.0.0.0:3000 by default
EXPOSE 3000
CMD ["npm", "start"]
