# Dockerfile (Node.js backend)
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /backend

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Accept build argument
ARG ENV

# Copy the backend code
COPY . .

# Copy the appropriate .env file into the image
COPY .env.${ENV} .env


# Expose the port the backend service will run on
EXPOSE 3001

# Start the backend service
CMD ["node", "server.js"]
