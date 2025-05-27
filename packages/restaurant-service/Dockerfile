FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root workspace files
COPY package.json pnpm-lock.yaml ./
COPY ../../pnpm-workspace.yaml ./

# Copy service package.json
COPY packages/restaurant-service/package.json ./packages/restaurant-service/

# Install dependencies
RUN pnpm install

# Copy prisma schema
COPY packages/restaurant-service/prisma ./packages/restaurant-service/prisma/

# Generate Prisma client
RUN cd packages/restaurant-service && npx prisma generate

# Copy source code
COPY packages/restaurant-service ./packages/restaurant-service/

# Build TypeScript code
RUN cd packages/restaurant-service && pnpm build

# Expose the port
EXPOSE 4001

# Start the service
CMD ["pnpm", "--filter", "restaurant-service", "start"]