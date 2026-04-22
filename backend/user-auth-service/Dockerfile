# FROM node:20-alpine
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci --only=production
# COPY . .
# EXPOSE 3001
# CMD ["npm", "start"]

# Use an official Node.js lightweight runtime
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the Auth Service port
EXPOSE 3001

# Command to run your app
CMD ["npm", "start"]