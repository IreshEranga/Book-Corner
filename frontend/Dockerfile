# ==================== STAGE 1: Build the React app ====================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the production app
RUN npm run build

# ==================== STAGE 2: Serve with Nginx ====================
FROM nginx:alpine

# Remove default Nginx config
RUN rm -rf /usr/share/nginx/html/*

# Copy built React files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config (optional but recommended)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]