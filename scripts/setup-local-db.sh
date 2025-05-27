#!/bin/bash

# Create the databases
psql -U postgres -c "CREATE DATABASE food_delivery_user;"
psql -U postgres -c "CREATE DATABASE food_delivery_restaurant;"
psql -U postgres -c "CREATE DATABASE food_delivery_delivery;"

# Create .env files from examples for each service
cp packages/user-service/.env.example packages/user-service/.env
cp packages/restaurant-service/.env.example packages/restaurant-service/.env
cp packages/delivery-agent-service/.env.example packages/delivery-agent-service/.env

# Run Prisma migrations for each service
cd packages/user-service && npx prisma migrate dev
cd ../restaurant-service && npx prisma migrate dev
cd ../delivery-agent-service && npx prisma migrate dev
