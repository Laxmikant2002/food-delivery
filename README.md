# Food Delivery App Backend

A microservices-based backend for a food delivery application built with Node.js, TypeScript, GraphQL, and PostgreSQL.

## Services & Endpoints

### 1. User Service (Port: 4000)
Base URL: `/api/v1`
- `GET /restaurants` - List available restaurants
- `POST /orders` - Place a new order
- `POST /ratings` - Submit ratings


### 2. Restaurant Service (Port: 4001)
Base URL: `/api/v1`
- `PUT /restaurants/{id}` - Update restaurant details
- `PUT /orders/{id}/accept` - Accept an order
- `PUT /orders/{id}/assign-agent` - Assign delivery agent

### 3. Delivery Agent Service (Port: 4002)
Base URL: `/api/v1`
- `PUT /orders/{id}/status` - Update delivery status


## Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Prisma (ORM)
- Docker
- pnpm (Package Manager)

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- Docker
- pnpm (`npm install -g pnpm`)

## Deployment

### Heroku Deployment

1. Create Heroku apps for each service:
```bash
heroku create food-delivery-user-service
heroku create food-delivery-restaurant-service
heroku create food-delivery-delivery-service
```

2. Add Heroku PostgreSQL add-on for each app:
```bash
heroku addons:create heroku-postgresql:hobby-dev -a food-delivery-user-service
heroku addons:create heroku-postgresql:hobby-dev -a food-delivery-restaurant-service
heroku addons:create heroku-postgresql:hobby-dev -a food-delivery-delivery-service
```

3. Set environment variables:
```bash
# For each service, set the required environment variables
heroku config:set JWT_SECRET=your_secret -a food-delivery-user-service
heroku config:set NODE_ENV=production -a food-delivery-user-service
```

4. Deploy:
```bash
git push heroku main
```

### Production Endpoints

After deployment, your services will be available at:

1. User Service:
```
https://food-delivery-user-service.herokuapp.com/api/v1
```

2. Restaurant Service:
```
https://food-delivery-restaurant-service.herokuapp.com/api/v1
```

3. Delivery Agent Service:
```
https://food-delivery-delivery-service.herokuapp.com/api/v1
```

## Environment Variables

Each service requires the following environment variables:

```env
PORT=4000 # (4001 for restaurant, 4002 for delivery)
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
NODE_ENV=production
```

## Running Locally

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL
- Docker (optional)
- pnpm (`npm install -g pnpm`)

### Setup Steps

1. **Install Dependencies**:
```bash
pnpm install
```

2. **Setup Environment Variables**:
```bash
cp packages/user-service/.env.example packages/user-service/.env
cp packages/restaurant-service/.env.example packages/restaurant-service/.env
cp packages/delivery-agent-service/.env.example packages/delivery-agent-service/.env
```

3. **Database Setup**:

Option 1 - Using Docker:
```bash
# Start PostgreSQL and create databases
docker compose -f docker-compose.dev.yml up -d
```

Option 2 - Using Local PostgreSQL:
```bash
# Create databases
psql -U postgres -c "CREATE DATABASE food_delivery_user;"
psql -U postgres -c "CREATE DATABASE food_delivery_restaurant;"
psql -U postgres -c "CREATE DATABASE food_delivery_delivery;"
```

4. **Run Prisma Migrations**:
```bash
pnpm prisma:generate  # Generate Prisma clients
pnpm prisma:migrate   # Run migrations for all services
```

5. **Start Services**:
```bash
pnpm dev  # Starts all services in development mode
```

The services will be available at:
- User Service: http://localhost:4000
- Restaurant Service: http://localhost:4001
- Delivery Agent Service: http://localhost:4002

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT