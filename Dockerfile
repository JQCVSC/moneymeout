# Stage 1: Build stage
FROM node:22-alpine AS builder

# Upgrade npm to latest version
RUN npm install -g npm@latest

WORKDIR /app

# Copy package configuration files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build production assets (Vite frontend + esbuild Express server)
RUN npm run build

# Stage 2: Production runner stage
FROM node:22-alpine AS runner

# Upgrade npm to latest version
RUN npm install -g npm@latest

WORKDIR /app

ENV NODE_ENV=production

# Copy package configuration files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev && npm cache clean --force

# Copy build outputs and configuration
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/firebase-applet-config.json* ./

# Expose default Cloud Run port
EXPOSE 8080

# Run compiled CommonJS Express server
CMD ["node", "dist/server.cjs"]
