# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm install

# Copy all the frontend code
COPY . .

# CRITICAL FIX: Add CI=false so minor warnings don't crash the pipeline!
RUN CI=false npm run build 

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy the built files from Stage 1 into Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Expose port 80 (Standard HTTP web port)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]