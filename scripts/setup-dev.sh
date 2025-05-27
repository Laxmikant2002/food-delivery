#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo "🚀 Setting up Food Delivery App development environment..."

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 14 or higher."
    exit 1
fi

if ! command_exists pnpm; then
    echo "❌ pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

if ! command_exists docker; then
    echo "⚠️  Docker is not installed. You'll need to set up PostgreSQL manually."
    while true; do
        read -p "Do you want to continue without Docker? (y/n) " yn
        case $yn in
            [Yy]* ) break;;
            [Nn]* ) echo "Please install Docker and try again."; exit 1;;
            * ) echo "Please answer y or n.";;
        esac
    done
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Setup environment variables
echo "🔧 Setting up environment variables..."
for service in user restaurant delivery-agent; do
    if [ ! -f "packages/${service}-service/.env" ]; then
        echo "Creating .env file for ${service}-service..."
        cp "packages/${service}-service/.env.example" "packages/${service}-service/.env"
    else
        echo "⚠️  .env file for ${service}-service already exists. Skipping..."
    fi
done

# Database setup
if command_exists docker; then
    echo "🐳 Setting up databases using Docker..."
    docker compose -f docker-compose.dev.yml up -d
    
    # Wait for PostgreSQL to be ready
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 10
else
    echo "💽 Setting up databases using local PostgreSQL..."
    if command_exists psql; then
        psql -U postgres -c "CREATE DATABASE food_delivery_user;" || true
        psql -U postgres -c "CREATE DATABASE food_delivery_restaurant;" || true
        psql -U postgres -c "CREATE DATABASE food_delivery_delivery;" || true
    else
        echo "❌ PostgreSQL client (psql) not found. Please install PostgreSQL or use Docker."
        exit 1
    fi
fi

# Generate Prisma clients and run migrations
echo "🔄 Running Prisma commands..."
pnpm prisma:generate
pnpm prisma:migrate

echo "✨ Setup complete! You can now run the services with:"
echo "🚀 pnpm dev"
echo ""
echo "Services will be available at:"
echo "📍 User Service: http://localhost:4000"
echo "📍 Restaurant Service: http://localhost:4001"
echo "📍 Delivery Service: http://localhost:4002"
