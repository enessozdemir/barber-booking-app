# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace configuration
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY package.json ./package.json
COPY client/package.json ./client/package.json

# Install dependencies for client workspace
RUN pnpm install --filter client --frozen-lockfile

# Copy client source code and config files
COPY client/ ./client/

# Build the application
RUN cd client && pnpm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace configuration
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY package.json ./package.json
COPY client/package.json ./client/package.json

# Install dependencies (not just prod, to include all runtime deps)
RUN pnpm install --filter client --frozen-lockfile

# Copy built files from builder stage to client directory
COPY --from=builder /app/client/dist ./client/dist

# Change to client directory where node_modules are
WORKDIR /app/client

# Expose port
EXPOSE 5173

# Set environment variable for port
ENV PORT=5173

# Start the application using vite preview
CMD ["pnpm", "run", "start"]
