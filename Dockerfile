
# Stage 1: Build dependencies
FROM node:22.12.0 AS builder

LABEL maintainer="Sukhad Adhikari <sukhadadhikari3@gmail.com>"
LABEL description="Fragments Node.js microservice - optimized build"

# Set environment
ENV NODE_ENV=development
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the source code
COPY . .

# Stage 2: Runtime image
FROM node:22.12.0-slim AS runtime

# Metadata
LABEL maintainer="Sukhad Adhikari <sukhadadhikari3@gmail.com>"
LABEL description="Fragments Node.js microservice - production runtime"

# Environment
ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app

# Copy only necessary artifacts from builder stage
COPY --from=builder /app /app
COPY tests/.htpasswd tests/.htpasswd

# Reduce npm logs and disable color
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

# Expose the port and run app
EXPOSE 8080
CMD ["npm", "start"]
