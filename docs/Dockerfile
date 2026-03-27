FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies (cached unless package files change)
COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/
COPY packages/react/package.json packages/react/
COPY packages/vue/package.json packages/vue/
COPY docs/package.json docs/
RUN npm ci

# Copy source code
COPY packages/core/ packages/core/
COPY docs/ docs/
COPY scripts/ scripts/

# Build core once, then copy assets and build docs (without re-building core)
RUN npm run build:core
RUN npm -w docs run copy-core && npx -w docs docusaurus build

# Serve static files with lightweight server
FROM node:20-alpine
RUN npm install -g serve@14
WORKDIR /app
COPY --from=build /app/docs/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
