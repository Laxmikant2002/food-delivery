# Food Delivery App - Troubleshooting Guide

This guide will help you verify and troubleshoot the setup of the food delivery microservices application.

## 1. Docker Setup Verification

### Check Docker Installation
```bash
# Check Docker version
docker --version
# Should output something like: Docker version 28.1.1

# Check Docker is running
docker info
# Should show detailed Docker information without connection errors
```

### Common Docker Issues
1. **Docker not running**
   - Error: `Cannot connect to the Docker daemon`
   - Solution: Start Docker Desktop and wait until the whale icon stops animating

2. **Port conflicts**
   - Error: `port is already allocated`
   - Solution: Stop any services using ports 4000-4002 and 5432

### Verify PostgreSQL Container
```bash
# Start PostgreSQL
docker-compose up -d postgres

# Check container status
docker ps
# Should show postgres container running on port 5432

# Check logs
docker logs food-delivery-monorepo-postgres-1
```

## 2. Project Setup Verification

### Check Prerequisites
```bash
# Node.js version (should be v14 or higher)
node --version

# pnpm version
pnpm --version

# TypeScript version
npx tsc --version
```

### Common TypeScript Errors

1. **Missing Type Definitions**
   Error:
   ```
   Cannot find module './graphql/typeDefs' or its corresponding type declarations
   ```
   Solution:
   - Check if file exists in `src/graphql/typeDefs.ts`
   - Create the file if missing:
   ```typescript
   // src/graphql/typeDefs.ts
   export const typeDefs = `
     type Query {
       _: String
     }
     type Mutation {
       _: String
     }
   `;
   ```

2. **Express Type Mismatch**
   Error:
   ```
   Type 'Express' is not assignable to type 'Application'
   ```
   Solution:
   - Update type imports in `src/index.ts`:
   ```typescript
   import express, { Application } from 'express';
   const app: Application = express();
   ```

3. **Constructor Arguments Error**
   Error:
   ```
   Expected 0 arguments, but got 1
   ```
   Solution:
   - Check class constructor parameters
   - Remove unnecessary constructor arguments

## 3. Service Startup Verification

### Start Services Individually
```bash
# User Service
cd packages/user-service
pnpm dev

# Restaurant Service
cd packages/restaurant-service
pnpm dev

# Delivery Agent Service
cd packages/delivery-agent-service
pnpm dev
```

### Verify Services are Running
```bash
# Check if services are listening
curl http://localhost:4000/graphql
curl http://localhost:4001/graphql
curl http://localhost:4002/graphql
```

### GraphQL Playground Access
- User Service: http://localhost:4000/graphql
- Restaurant Service: http://localhost:4001/graphql
- Delivery Agent Service: http://localhost:4002/graphql

## 4. Database Migration Verification

```bash
# Reset and run migrations for User Service
cd packages/user-service
npx prisma migrate reset --force

# Reset and run migrations for Restaurant Service
cd ../restaurant-service
npx prisma migrate reset --force

# Reset and run migrations for Delivery Service
cd ../delivery-agent-service
npx prisma migrate reset --force
```

## 5. Environment Variables

Each service needs its own `.env` file:

### User Service (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/food_delivery_user"
JWT_SECRET=user_service_secret
PORT=4000
```

### Restaurant Service (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/food_delivery_restaurant"
JWT_SECRET=restaurant_service_secret
PORT=4001
```

### Delivery Agent Service (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/food_delivery_delivery"
JWT_SECRET=delivery_service_secret
PORT=4002
```

## 6. Testing with Postman

1. Import `postman_collection.json`
2. Test endpoints in order:

   **User Service**
   - Sign Up
   - Sign In (save token)
   - Get Available Restaurants

   **Restaurant Service**
   - Create Menu Item
   - Update Restaurant
   - Accept Order

   **Delivery Service**
   - Update Availability
   - Start Delivery
   - Complete Delivery

### Common Testing Issues
1. **Authentication Errors**
   - Error: `Unauthorized`
   - Solution: Add token to Authorization header: `Bearer <token>`

2. **GraphQL Validation Errors**
   - Error: `Variable "$input" got invalid value`
   - Solution: Check input types match schema definition

## 7. Logs and Debugging

### View Service Logs
```bash
# User Service logs
cd packages/user-service
pnpm dev | tee user-service.log

# Restaurant Service logs
cd ../restaurant-service
pnpm dev | tee restaurant-service.log

# Delivery Service logs
cd ../delivery-agent-service
pnpm dev | tee delivery-agent-service.log
```

### Debug Mode
Add `DEBUG=*` to see detailed logs:
```bash
DEBUG=* pnpm dev
```

## 8. Clean Up

```bash
# Stop all services
docker-compose down

# Remove volumes
docker-compose down -v

# Clean node_modules
pnpm clean

# Fresh install
pnpm install
``` 