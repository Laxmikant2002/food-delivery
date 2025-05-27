FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root workspace files
COPY package.json pnpm-lock.yaml ./
COPY ../../pnpm-workspace.yaml ./

# Copy service package.json
COPY packages/delivery-agent-service/package.json ./packages/delivery-agent-service/

# Install dependencies
RUN pnpm install

# Copy prisma schema
COPY packages/delivery-agent-service/prisma ./packages/delivery-agent-service/prisma/

# Generate Prisma client
RUN cd packages/delivery-agent-service && npx prisma generate

# Copy source code
COPY packages/delivery-agent-service ./packages/delivery-agent-service/

# Build TypeScript code
RUN cd packages/delivery-agent-service && pnpm build

# Expose the port
EXPOSE 4002

# Start the service
CMD ["pnpm", "--filter", "delivery-agent-service", "start"]