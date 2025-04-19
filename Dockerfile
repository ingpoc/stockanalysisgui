FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 build-base linux-headers eudev-dev pkgconfig libusb-dev \
    && ln -sf /usr/bin/python3 /usr/bin/python

# Copy package manifests and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose application port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "start"] 