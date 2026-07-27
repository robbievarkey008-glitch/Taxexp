FROM node:22-alpine

# Install openssl and common build tools
RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

# Ensure we install ALL dependencies for the build step
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Build the app
RUN npm run build

# After building, prune dev dependencies to reduce image size
RUN npm prune --omit=dev

# Set production environment for runtime
ENV NODE_ENV=production

CMD ["npm", "run", "start"]
