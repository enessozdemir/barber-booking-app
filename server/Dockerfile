# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace configuration
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY package.json ./package.json
COPY server/package.json ./server/package.json

# Install dependencies for server workspace
RUN pnpm install --filter server --frozen-lockfile

# Copy server source code
COPY server/ ./server/

# Build TypeScript
RUN cd server && pnpm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace configuration
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY package.json ./package.json
COPY server/package.json ./server/package.json

# Install dependencies (not just prod, to include all runtime deps)
RUN pnpm install --filter server --frozen-lockfile

# Copy built files from builder stage to server directory
COPY --from=builder /app/server/dist ./server/dist

# Change to server directory where node_modules are
WORKDIR /app/server

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/server.js"]
