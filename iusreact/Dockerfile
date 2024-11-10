# Dockerfile (Next.js)

# Base Stage
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Accept build argument
ARG ENV=production

# Install dependencies based on ENV
RUN if [ "$ENV" = "production" ]; then \
      npm ci --only=production; \
    else \
      npm install --frozen-lockfile; \
    fi

# Copy source code
COPY . .

# Copy the appropriate .env file into the image
COPY .env.${ENV} .env

# Build Stage (for production)
FROM base AS build

ARG ENV

# Build the app in production
RUN if [ "$ENV" = "production" ]; then \
      npm run build; \
    fi

# Production Stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy necessary files from the build stage
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/.env /app/.env
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/.next /app/.next

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]

# Development Stage
FROM node:18-alpine AS development

WORKDIR /app

# Copy the entire app from the base stage (includes source code and node_modules)
COPY --from=base /app /app

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "dev"]
