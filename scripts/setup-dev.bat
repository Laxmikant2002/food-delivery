@echo off
setlocal enabledelayedexpansion

echo 🚀 Setting up Food Delivery App development environment...

REM Check prerequisites
echo 📋 Checking prerequisites...

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 14 or higher.
    exit /b 1
)

where pnpm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ pnpm is not installed. Installing pnpm...
    npm install -g pnpm
)

where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Docker is not installed. You'll need to set up PostgreSQL manually.
    set /p answer="Do you want to continue without Docker? (y/n) "
    if /i "!answer!"=="n" (
        echo Please install Docker and try again.
        exit /b 1
    )
)

REM Install dependencies
echo 📦 Installing dependencies...
call pnpm install

REM Setup environment variables
echo 🔧 Setting up environment variables...
for %%s in (user restaurant delivery-agent) do (
    if not exist "packages\%%s-service\.env" (
        echo Creating .env file for %%s-service...
        copy "packages\%%s-service\.env.example" "packages\%%s-service\.env"
    ) else (
        echo ⚠️  .env file for %%s-service already exists. Skipping...
    )
)

REM Database setup
where docker >nul 2>&1
if %errorlevel% equ 0 (
    echo 🐳 Setting up databases using Docker...
    docker compose -f docker-compose.dev.yml up -d
    
    REM Wait for PostgreSQL to be ready
    echo ⏳ Waiting for PostgreSQL to be ready...
    timeout /t 10 /nobreak > nul
) else (
    echo 💽 Setting up databases using local PostgreSQL...
    where psql >nul 2>&1
    if %errorlevel% equ 0 (
        psql -U postgres -c "CREATE DATABASE food_delivery_user;" 2>nul
        psql -U postgres -c "CREATE DATABASE food_delivery_restaurant;" 2>nul
        psql -U postgres -c "CREATE DATABASE food_delivery_delivery;" 2>nul
    ) else (
        echo ❌ PostgreSQL client (psql) not found. Please install PostgreSQL or use Docker.
        exit /b 1
    )
)

REM Generate Prisma clients and run migrations
echo 🔄 Running Prisma commands...
call pnpm prisma:generate
call pnpm prisma:migrate

echo ✨ Setup complete! You can now run the services with:
echo 🚀 pnpm dev
echo.
echo Services will be available at:
echo 📍 User Service: http://localhost:4000
echo 📍 Restaurant Service: http://localhost:4001
echo 📍 Delivery Service: http://localhost:4002

endlocal
