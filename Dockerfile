# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the Next.js app
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built app from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src

# Create campaign directories
RUN mkdir -p /app/src/app/campaigns && \
    mkdir -p /app/public/campaigns && \
    mkdir -p /app/data/campaigns

# Create volume mount points
VOLUME ["/app/src/app/campaigns", "/app/public/campaigns", "/app/data/campaigns"]

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
