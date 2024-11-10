# Dockerfile (Next.js)

# Base Stage: Install all dependencies and copy source code
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (both dependencies and devDependencies)
RUN npm install --frozen-lockfile

# Copy source code
COPY . .

# Copy the appropriate .env file into the image
ARG ENV=production
COPY .env.${ENV} .env

# Build Stage: Build the app (only for production)
FROM base AS build

# Accept build argument
ARG ENV=production

# Build the app if ENV is production
RUN if [ "$ENV" = "production" ]; then \
      npm run build; \
    fi

# Production Stage: Create the production image
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy necessary files from the build stage
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/package-lock.json /app/package-lock.json
COPY --from=build /app/.env /app/.env
COPY --from=build /app/.next /app/.next

# Install only production dependencies
RUN npm ci --only=production

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the app
CMD ["npm", "start"]

# Development Stage: Create the development image
FROM node:18-alpine AS development

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install --frozen-lockfile

# Copy source code
COPY . .

# Copy the appropriate .env file into the image
ARG ENV=development
COPY .env.${ENV} .env

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3000

# Start the app
CMD ["npm", "run", "dev"]
