# Multi-stage build for Angular app with Nginx
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app for production
RUN npm run build -- --configuration production

# Production stage with Nginx
FROM nginx:alpine

# Copy built app from builder stage (handle both Angular 17+ and older versions)
COPY --from=builder /app/dist/list-of-books-app/browser /usr/share/nginx/html

# Copy custom nginx configuration (optional)
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 4200
EXPOSE 4200

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]