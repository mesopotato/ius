# Dockerfile (Next.js)
# Use official Node.js image as a base
FROM node:18-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy the rest of the app's source code
COPY . .

# Build the Next.js app for production
RUN npm run build

# Install only production dependencies
RUN npm ci --production

# Use a lightweight Node.js runtime to serve the app
FROM node:18-alpine AS runner

# Set working directory inside the container
WORKDIR /app

# Copy built files and production dependencies from the builder stage
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port the app will run on
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]
