# Food Delivery App Backend

A microservices-based backend for a food delivery application built with Node.js, TypeScript, GraphQL, and PostgreSQL.

## Services

The application consists of three microservices:

1. **User Service** (Port: 4000)
   - User authentication
   - Restaurant listing
   - Order placement
   - Rating submission

2. **Restaurant Service** (Port: 4001)
   - Restaurant management
   - Menu management
   - Order processing
   - Delivery agent assignment

3. **Delivery Agent Service** (Port: 4002)
   - Delivery status management
   - Location tracking
   - Order delivery management

## Tech Stack

- Node.js
- TypeScript
- GraphQL (Apollo Server)
- PostgreSQL
- Prisma (ORM)
- Docker
- pnpm (Package Manager)

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- Docker
- pnpm (`npm install -g pnpm`)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd food-delivery-monorepo
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create `.env` files in each service directory:

   user-service/.env:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/food_delivery_user"
   JWT_SECRET=user_service_secret
   PORT=4000
   ```

   restaurant-service/.env:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/food_delivery_restaurant"
   JWT_SECRET=restaurant_service_secret
   PORT=4001
   ```

   delivery-agent-service/.env:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/food_delivery_delivery"
   JWT_SECRET=delivery_service_secret
   PORT=4002
   ```

4. Start PostgreSQL:
   ```bash
   docker-compose up -d
   ```

5. Run database migrations:
   ```bash
   cd packages/user-service && npx prisma migrate dev
   cd ../restaurant-service && npx prisma migrate dev
   cd ../delivery-agent-service && npx prisma migrate dev
   ```

## Running the Services

1. Start all services:
   ```bash
   pnpm dev
   ```

2. Access the GraphQL playgrounds:
   - User Service: http://localhost:4000/graphql
   - Restaurant Service: http://localhost:4001/graphql
   - Delivery Agent Service: http://localhost:4002/graphql

## API Documentation

### User Service

#### Queries
- `availableRestaurants`: Get list of available restaurants
- `me`: Get current user details
- `order(id: ID!)`: Get order details
- `myOrders`: Get user's order history

#### Mutations
- `signUp(input: SignUpInput!)`: Register new user
- `signIn(input: SignInInput!)`: User login
- `placeOrder(input: PlaceOrderInput!)`: Place new order
- `submitRating(input: RatingInput!)`: Submit order rating

### Restaurant Service

#### Queries
- `restaurant(id: ID!)`: Get restaurant details
- `restaurantOrders(status: OrderStatus)`: Get restaurant orders
- `menuItems`: Get restaurant menu items
- `pendingOrders`: Get pending orders

#### Mutations
- `updateRestaurant(input: UpdateRestaurantInput!)`: Update restaurant details
- `createMenuItem(input: CreateMenuItemInput!)`: Add menu item
- `updateMenuItem(id: ID!, input: UpdateMenuItemInput!)`: Update menu item
- `deleteMenuItem(id: ID!)`: Delete menu item
- `acceptOrder(orderId: ID!)`: Accept order
- `rejectOrder(orderId: ID!, reason: String!)`: Reject order

### Delivery Agent Service

#### Queries
- `me`: Get agent details
- `currentOrder`: Get current delivery
- `orderHistory`: Get delivery history
- `availableOrders`: Get available orders

#### Mutations
- `updateAvailability(isAvailable: Boolean!)`: Update availability status
- `updateLocation(input: UpdateLocationInput!)`: Update location
- `startDelivery(orderId: ID!)`: Start order delivery
- `completeDelivery(orderId: ID!)`: Complete order delivery

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Error Handling

The API uses standard GraphQL error handling with custom error types:
- `AuthenticationError`: Authentication issues
- `UserInputError`: Invalid input data
- `ForbiddenError`: Permission issues

## Testing

Run tests for all services:
```bash
pnpm test
```

## Deployment

The services can be deployed individually or using Docker Compose:

1. Build Docker images:
   ```bash
   docker-compose build
   ```

2. Deploy:
   ```bash
   docker-compose up -d
   ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT