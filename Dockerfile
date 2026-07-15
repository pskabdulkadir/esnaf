# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --include=optional --no-audit --no-fund

# Copy source code
COPY . .

# Build frontend (Vite) and backend (esbuild)
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm install --omit=dev --include=optional --no-audit --no-fund

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/db_data.json ./db_data.json 2>/dev/null || true

# Create backups directory and persistent data directory
RUN mkdir -p .backups /var/data

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV RENDER=true

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/server.cjs"]
